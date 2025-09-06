import { Commission, CommissionAvecMembres, CommissionFilters, ID, Membre } from '../types/entities';
import { storageService } from './storage';
import { validationService } from './validation';

/**
 * Service de gestion des commissions
 */

class CommissionsService {
  /**
   * Récupère toutes les commissions
   */
  getAll(): Commission[] {
    return storageService.getCommissions();
  }

  /**
   * Récupère une commission par son ID
   */
  getById(id: ID): Commission | null {
    const commissions = this.getAll();
    return commissions.find(c => c.id === id) || null;
  }

  /**
   * Récupère les commissions avec leurs membres
   */
  getAllWithMembres(): CommissionAvecMembres[] {
    const commissions = this.getAll();
    const membres = storageService.getMembres();

    return commissions.map(commission => {
      const commissionMembres = membres.filter(m => 
        commission.membresIds.includes(m.id)
      );
      const president = commission.presidentMembreId 
        ? membres.find(m => m.id === commission.presidentMembreId)
        : undefined;

      return {
        ...commission,
        membres: commissionMembres,
        president
      };
    });
  }

  /**
   * Récupère une commission avec ses membres
   */
  getByIdWithMembres(id: ID): CommissionAvecMembres | null {
    const commission = this.getById(id);
    if (!commission) return null;

    const membres = storageService.getMembres();
    const commissionMembres = membres.filter(m => 
      commission.membresIds.includes(m.id)
    );
    const president = commission.presidentMembreId 
      ? membres.find(m => m.id === commission.presidentMembreId)
      : undefined;

    return {
      ...commission,
      membres: commissionMembres,
      president
    };
  }

  /**
   * Recherche et filtre les commissions
   */
  search(filters: CommissionFilters): Commission[] {
    let commissions = this.getAll();

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      commissions = commissions.filter(c => 
        c.nom.toLowerCase().includes(searchTerm) ||
        (c.description && c.description.toLowerCase().includes(searchTerm))
      );
    }

    return commissions;
  }

  /**
   * Crée une nouvelle commission
   */
  create(commissionData: Omit<Commission, 'id' | 'createdAt'>): { success: boolean; commission?: Commission; errors?: Record<string, string> } {
    // Validation
    const validation = validationService.validateCommission(commissionData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité du nom
    const existingCommissions = this.getAll();
    const duplicate = existingCommissions.find(c => 
      c.nom.toLowerCase() === commissionData.nom.toLowerCase()
    );

    if (duplicate) {
      return { 
        success: false, 
        errors: { nom: 'Une commission avec ce nom existe déjà' }
      };
    }

    // Vérification que tous les membres existent
    const membres = storageService.getMembres();
    const invalidMembres = commissionData.membresIds.filter(id => 
      !membres.find(m => m.id === id)
    );

    if (invalidMembres.length > 0) {
      return {
        success: false,
        errors: { membresIds: `Membres introuvables: ${invalidMembres.join(', ')}` }
      };
    }

    // Nettoyage des données
    const cleanedData = {
      ...commissionData,
      nom: validationService.sanitizeString(commissionData.nom),
      description: commissionData.description ? validationService.sanitizeString(commissionData.description) : undefined,
      membresIds: [...new Set(commissionData.membresIds)] // Supprimer les doublons
    };

    try {
      const newCommission = storageService.addCommission(cleanedData);
      return { success: true, commission: newCommission };
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la création de la commission' } };
    }
  }

  /**
   * Met à jour une commission
   */
  update(id: ID, updates: Partial<Commission>): { success: boolean; commission?: Commission; errors?: Record<string, string> } {
    // Vérification de l'existence
    const existingCommission = this.getById(id);
    if (!existingCommission) {
      return { success: false, errors: { general: 'Commission introuvable' } };
    }

    // Validation des nouvelles données
    const updatedData = { ...existingCommission, ...updates };
    const validation = validationService.validateCommission(updatedData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité du nom si modifié
    if (updates.nom) {
      const existingCommissions = this.getAll();
      const duplicate = existingCommissions.find(c => 
        c.id !== id && c.nom.toLowerCase() === updates.nom!.toLowerCase()
      );

      if (duplicate) {
        return { 
          success: false, 
          errors: { nom: 'Une commission avec ce nom existe déjà' }
        };
      }
    }

    // Vérification que tous les membres existent si la liste est modifiée
    if (updates.membresIds) {
      const membres = storageService.getMembres();
      const invalidMembres = updates.membresIds.filter(id => 
        !membres.find(m => m.id === id)
      );

      if (invalidMembres.length > 0) {
        return {
          success: false,
          errors: { membresIds: `Membres introuvables: ${invalidMembres.join(', ')}` }
        };
      }
    }

    // Nettoyage des données
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.nom) {
      cleanedUpdates.nom = validationService.sanitizeString(cleanedUpdates.nom);
    }
    if (cleanedUpdates.description) {
      cleanedUpdates.description = validationService.sanitizeString(cleanedUpdates.description);
    }
    if (cleanedUpdates.membresIds) {
      cleanedUpdates.membresIds = [...new Set(cleanedUpdates.membresIds)]; // Supprimer les doublons
    }

    try {
      const success = storageService.updateCommission(id, cleanedUpdates);
      if (success) {
        const updatedCommission = this.getById(id);
        return { success: true, commission: updatedCommission! };
      } else {
        return { success: false, errors: { general: 'Erreur lors de la mise à jour' } };
      }
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la mise à jour de la commission' } };
    }
  }

  /**
   * Supprime une commission
   */
  delete(id: ID): { success: boolean; message: string } {
    const commission = this.getById(id);
    if (!commission) {
      return { success: false, message: 'Commission introuvable' };
    }

    try {
      const success = storageService.deleteCommission(id);
      if (success) {
        return { 
          success: true, 
          message: `La commission "${commission.nom}" a été supprimée avec succès`
        };
      } else {
        return { success: false, message: 'Erreur lors de la suppression' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la suppression de la commission' };
    }
  }

  /**
   * Ajoute un membre à une commission
   */
  addMembre(commissionId: ID, membreId: ID): { success: boolean; message: string } {
    const commission = this.getById(commissionId);
    if (!commission) {
      return { success: false, message: 'Commission introuvable' };
    }

    const membres = storageService.getMembres();
    const membre = membres.find(m => m.id === membreId);
    if (!membre) {
      return { success: false, message: 'Membre introuvable' };
    }

    if (commission.membresIds.includes(membreId)) {
      return { success: false, message: 'Ce membre fait déjà partie de la commission' };
    }

    const result = this.update(commissionId, {
      membresIds: [...commission.membresIds, membreId]
    });

    if (result.success) {
      return { 
        success: true, 
        message: `${membre.prenom} ${membre.nom} a été ajouté(e) à la commission "${commission.nom}"`
      };
    }

    return { success: false, message: 'Erreur lors de l\'ajout du membre' };
  }

  /**
   * Retire un membre d'une commission
   */
  removeMembre(commissionId: ID, membreId: ID): { success: boolean; message: string } {
    const commission = this.getById(commissionId);
    if (!commission) {
      return { success: false, message: 'Commission introuvable' };
    }

    const membres = storageService.getMembres();
    const membre = membres.find(m => m.id === membreId);
    if (!membre) {
      return { success: false, message: 'Membre introuvable' };
    }

    if (!commission.membresIds.includes(membreId)) {
      return { success: false, message: 'Ce membre ne fait pas partie de la commission' };
    }

    // Si c'est le président, le retirer aussi de la présidence
    const updates: Partial<Commission> = {
      membresIds: commission.membresIds.filter(id => id !== membreId)
    };

    if (commission.presidentMembreId === membreId) {
      updates.presidentMembreId = undefined;
    }

    const result = this.update(commissionId, updates);

    if (result.success) {
      const message = commission.presidentMembreId === membreId
        ? `${membre.prenom} ${membre.nom} a été retiré(e) de la commission "${commission.nom}" et n'en est plus le/la président(e)`
        : `${membre.prenom} ${membre.nom} a été retiré(e) de la commission "${commission.nom}"`;
      
      return { success: true, message };
    }

    return { success: false, message: 'Erreur lors du retrait du membre' };
  }

  /**
   * Définit le président d'une commission
   */
  setPresident(commissionId: ID, membreId: ID): { success: boolean; message: string } {
    const commission = this.getById(commissionId);
    if (!commission) {
      return { success: false, message: 'Commission introuvable' };
    }

    const membres = storageService.getMembres();
    const membre = membres.find(m => m.id === membreId);
    if (!membre) {
      return { success: false, message: 'Membre introuvable' };
    }

    if (!commission.membresIds.includes(membreId)) {
      return { success: false, message: 'Ce membre ne fait pas partie de la commission' };
    }

    const result = this.update(commissionId, {
      presidentMembreId: membreId
    });

    if (result.success) {
      return { 
        success: true, 
        message: `${membre.prenom} ${membre.nom} est maintenant président(e) de la commission "${commission.nom}"`
      };
    }

    return { success: false, message: 'Erreur lors de la nomination du président' };
  }

  /**
   * Retire le président d'une commission
   */
  removePresident(commissionId: ID): { success: boolean; message: string } {
    const commission = this.getById(commissionId);
    if (!commission) {
      return { success: false, message: 'Commission introuvable' };
    }

    if (!commission.presidentMembreId) {
      return { success: false, message: 'Cette commission n\'a pas de président' };
    }

    const result = this.update(commissionId, {
      presidentMembreId: undefined
    });

    if (result.success) {
      return { 
        success: true, 
        message: `Le président de la commission "${commission.nom}" a été retiré`
      };
    }

    return { success: false, message: 'Erreur lors du retrait du président' };
  }

  /**
   * Obtient les statistiques des commissions
   */
  getStats() {
    const commissions = this.getAll();
    const membres = storageService.getMembres();
    
    let totalMembres = 0;
    let commissionsAvecPresident = 0;
    
    commissions.forEach(c => {
      totalMembres += c.membresIds.length;
      if (c.presidentMembreId) commissionsAvecPresident++;
    });

    return {
      total: commissions.length,
      avecPresident: commissionsAvecPresident,
      sansPresident: commissions.length - commissionsAvecPresident,
      totalMembresAffectes: totalMembres,
      moyenneMembresParCommission: commissions.length > 0 ? Math.round(totalMembres / commissions.length) : 0
    };
  }

  /**
   * Obtient les commissions d'un membre
   */
  getByMembre(membreId: ID): Commission[] {
    return this.getAll().filter(c => c.membresIds.includes(membreId));
  }

  /**
   * Vérifie si un membre est président d'une commission
   */
  isPresident(membreId: ID): { isPresident: boolean; commission?: Commission } {
    const commission = this.getAll().find(c => c.presidentMembreId === membreId);
    return {
      isPresident: !!commission,
      commission
    };
  }

  /**
   * Exporte les commissions au format simple pour les exports
   */
  getForExport(): any[] {
    const commissionsAvecMembres = this.getAllWithMembres();

    return commissionsAvecMembres.map(commission => ({
      ID: commission.id,
      Nom: commission.nom,
      Description: commission.description || '',
      'Nombre de membres': commission.membres.length,
      'Président(e)': commission.president ? `${commission.president.prenom} ${commission.president.nom}` : '',
      Membres: commission.membres.map(m => `${m.prenom} ${m.nom}`).join(', '),
      'Date création': new Date(commission.createdAt).toLocaleDateString('fr-FR'),
      'Dernière modification': commission.updatedAt ? new Date(commission.updatedAt).toLocaleDateString('fr-FR') : ''
    }));
  }

  /**
   * Exporte les détails d'une commission pour PDF
   */
  getCommissionForPdfExport(id: ID): any {
    const commission = this.getByIdWithMembres(id);
    if (!commission) return null;

    return {
      nom: commission.nom,
      description: commission.description || '',
      president: commission.president ? {
        nom: `${commission.president.prenom} ${commission.president.nom}`,
        telephone: commission.president.telephone || '',
        adresse: commission.president.adresse || ''
      } : null,
      membres: commission.membres.map(m => ({
        nom: `${m.prenom} ${m.nom}`,
        telephone: m.telephone || '',
        adresse: m.adresse || '',
        statut: m.actif ? 'Actif' : 'Inactif'
      })),
      stats: {
        totalMembres: commission.membres.length,
        membresActifs: commission.membres.filter(m => m.actif).length,
        dateCreation: new Date(commission.createdAt).toLocaleDateString('fr-FR'),
        derniereModification: commission.updatedAt ? new Date(commission.updatedAt).toLocaleDateString('fr-FR') : ''
      }
    };
  }
}

// Instance singleton
export const commissionsService = new CommissionsService();

