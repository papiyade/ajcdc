import { Membre, MembreAvecCommissions, MembreFilters, ID } from '../types/entities';
import { storageService } from './storage';
import { validationService } from './validation';

/**
 * Service de gestion des membres
 */

class MembresService {
  /**
   * Récupère tous les membres
   */
  getAll(): Membre[] {
    return storageService.getMembres();
  }

  /**
   * Récupère un membre par son ID
   */
  getById(id: ID): Membre | null {
    const membres = this.getAll();
    return membres.find(m => m.id === id) || null;
  }

  /**
   * Récupère les membres avec leurs commissions
   */
  getAllWithCommissions(): MembreAvecCommissions[] {
    const membres = this.getAll();
    const commissions = storageService.getCommissions();

    return membres.map(membre => {
      const membreCommissions = commissions.filter(c => 
        c.membresIds.includes(membre.id)
      );
      const estPresident = commissions.some(c => 
        c.presidentMembreId === membre.id
      );

      return {
        ...membre,
        commissions: membreCommissions,
        estPresident
      };
    });
  }

  /**
   * Recherche et filtre les membres
   */
  search(filters: MembreFilters): Membre[] {
    let membres = this.getAll();

    // Filtre par statut actif
    if (filters.actif !== undefined) {
      membres = membres.filter(m => m.actif === filters.actif);
    }

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      membres = membres.filter(m => 
        m.prenom.toLowerCase().includes(searchTerm) ||
        m.nom.toLowerCase().includes(searchTerm) ||
        (m.telephone && m.telephone.toLowerCase().includes(searchTerm)) ||
        (m.adresse && m.adresse.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre membres sans commission
    if (filters.sansCommission) {
      const commissions = storageService.getCommissions();
      const membresAvecCommission = new Set<ID>();
      
      commissions.forEach(c => {
        c.membresIds.forEach(id => membresAvecCommission.add(id));
      });

      membres = membres.filter(m => !membresAvecCommission.has(m.id));
    }

    return membres;
  }

  /**
   * Crée un nouveau membre
   */
  create(membreData: Omit<Membre, 'id' | 'createdAt'>): { success: boolean; membre?: Membre; errors?: Record<string, string> } {
    // Validation
    const validation = validationService.validateMembre(membreData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité (prénom + nom)
    const existingMembres = this.getAll();
    const duplicate = existingMembres.find(m => 
      m.prenom.toLowerCase() === membreData.prenom.toLowerCase() &&
      m.nom.toLowerCase() === membreData.nom.toLowerCase()
    );

    if (duplicate) {
      return { 
        success: false, 
        errors: { general: 'Un membre avec ce prénom et nom existe déjà' }
      };
    }

    // Nettoyage des données
    const cleanedData = {
      ...membreData,
      prenom: validationService.sanitizeString(membreData.prenom),
      nom: validationService.sanitizeString(membreData.nom),
      adresse: membreData.adresse ? validationService.sanitizeString(membreData.adresse) : undefined,
      telephone: membreData.telephone ? validationService.formatPhone(membreData.telephone) : undefined
    };

    try {
      const newMembre = storageService.addMembre(cleanedData);
      return { success: true, membre: newMembre };
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la création du membre' } };
    }
  }

  /**
   * Met à jour un membre
   */
  update(id: ID, updates: Partial<Membre>): { success: boolean; membre?: Membre; errors?: Record<string, string> } {
    // Vérification de l'existence
    const existingMembre = this.getById(id);
    if (!existingMembre) {
      return { success: false, errors: { general: 'Membre introuvable' } };
    }

    // Validation des nouvelles données
    const updatedData = { ...existingMembre, ...updates };
    const validation = validationService.validateMembre(updatedData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité si prénom/nom modifiés
    if (updates.prenom || updates.nom) {
      const existingMembres = this.getAll();
      const duplicate = existingMembres.find(m => 
        m.id !== id &&
        m.prenom.toLowerCase() === (updates.prenom || existingMembre.prenom).toLowerCase() &&
        m.nom.toLowerCase() === (updates.nom || existingMembre.nom).toLowerCase()
      );

      if (duplicate) {
        return { 
          success: false, 
          errors: { general: 'Un membre avec ce prénom et nom existe déjà' }
        };
      }
    }

    // Nettoyage des données
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.prenom) {
      cleanedUpdates.prenom = validationService.sanitizeString(cleanedUpdates.prenom);
    }
    if (cleanedUpdates.nom) {
      cleanedUpdates.nom = validationService.sanitizeString(cleanedUpdates.nom);
    }
    if (cleanedUpdates.adresse) {
      cleanedUpdates.adresse = validationService.sanitizeString(cleanedUpdates.adresse);
    }
    if (cleanedUpdates.telephone) {
      cleanedUpdates.telephone = validationService.formatPhone(cleanedUpdates.telephone);
    }

    try {
      const success = storageService.updateMembre(id, cleanedUpdates);
      if (success) {
        const updatedMembre = this.getById(id);
        return { success: true, membre: updatedMembre! };
      } else {
        return { success: false, errors: { general: 'Erreur lors de la mise à jour' } };
      }
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la mise à jour du membre' } };
    }
  }

  /**
   * Supprime un membre
   */
  delete(id: ID): { success: boolean; message: string } {
    const membre = this.getById(id);
    if (!membre) {
      return { success: false, message: 'Membre introuvable' };
    }

    // Vérifier si le membre est président d'une commission
    const commissions = storageService.getCommissions();
    const commissionPresidee = commissions.find(c => c.presidentMembreId === id);
    
    if (commissionPresidee) {
      return { 
        success: false, 
        message: `Impossible de supprimer ${membre.prenom} ${membre.nom} car il/elle est président(e) de la commission "${commissionPresidee.nom}". Veuillez d'abord changer le président de cette commission.`
      };
    }

    try {
      const success = storageService.deleteMembre(id);
      if (success) {
        return { 
          success: true, 
          message: `${membre.prenom} ${membre.nom} a été supprimé(e) avec succès`
        };
      } else {
        return { success: false, message: 'Erreur lors de la suppression' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la suppression du membre' };
    }
  }

  /**
   * Active/désactive un membre
   */
  toggleActive(id: ID): { success: boolean; membre?: Membre; message: string } {
    const membre = this.getById(id);
    if (!membre) {
      return { success: false, message: 'Membre introuvable' };
    }

    const result = this.update(id, { actif: !membre.actif });
    if (result.success) {
      const status = result.membre!.actif ? 'activé' : 'désactivé';
      return {
        success: true,
        membre: result.membre,
        message: `${membre.prenom} ${membre.nom} a été ${status}`
      };
    }

    return { success: false, message: 'Erreur lors du changement de statut' };
  }

  /**
   * Obtient les statistiques des membres
   */
  getStats() {
    const membres = this.getAll();
    const commissions = storageService.getCommissions();
    
    const membresAvecCommission = new Set<ID>();
    let presidentsCount = 0;
    
    commissions.forEach(c => {
      c.membresIds.forEach(id => membresAvecCommission.add(id));
      if (c.presidentMembreId) presidentsCount++;
    });

    return {
      total: membres.length,
      actifs: membres.filter(m => m.actif).length,
      inactifs: membres.filter(m => !m.actif).length,
      avecCommission: membresAvecCommission.size,
      sansCommission: membres.length - membresAvecCommission.size,
      presidents: presidentsCount
    };
  }

  /**
   * Obtient les membres disponibles pour une commission (non affectés)
   */
  getAvailableForCommission(excludeCommissionId?: ID): Membre[] {
    const membres = this.getAll().filter(m => m.actif);
    const commissions = storageService.getCommissions()
      .filter(c => excludeCommissionId ? c.id !== excludeCommissionId : true);
    
    const membresOccupes = new Set<ID>();
    commissions.forEach(c => {
      c.membresIds.forEach(id => membresOccupes.add(id));
    });

    return membres.filter(m => !membresOccupes.has(m.id));
  }

  /**
   * Exporte les membres au format simple pour les exports
   */
  getForExport(includeInactifs = false): any[] {
    const membres = includeInactifs ? this.getAll() : this.getAll().filter(m => m.actif);
    const membresAvecCommissions = this.getAllWithCommissions();

    return membres.map(membre => {
      const membreAvecCommissions = membresAvecCommissions.find(m => m.id === membre.id);
      return {
        ID: membre.id,
        Prénom: membre.prenom,
        Nom: membre.nom,
        Adresse: membre.adresse || '',
        Téléphone: membre.telephone || '',
        Statut: membre.actif ? 'Actif' : 'Inactif',
        Commissions: membreAvecCommissions?.commissions.map(c => c.nom).join(', ') || '',
        'Président de': membreAvecCommissions?.estPresident ? 'Oui' : 'Non',
        'Date création': new Date(membre.createdAt).toLocaleDateString('fr-FR'),
        'Dernière modification': membre.updatedAt ? new Date(membre.updatedAt).toLocaleDateString('fr-FR') : ''
      };
    });
  }
}

// Instance singleton
export const membresService = new MembresService();

