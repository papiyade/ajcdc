import { PV, PVFilters, PVFichier, ID } from '../types/entities';
import { storageService } from './storage';
import { validationService } from './validation';

/**
 * Service de gestion des procès-verbaux
 */

class PVService {
  /**
   * Récupère tous les PV
   */
  getAll(): PV[] {
    return storageService.getPV();
  }

  /**
   * Récupère un PV par son ID
   */
  getById(id: ID): PV | null {
    const pvList = this.getAll();
    return pvList.find(p => p.id === id) || null;
  }

  /**
   * Recherche et filtre les PV
   */
  search(filters: PVFilters): PV[] {
    let pvList = this.getAll();

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      pvList = pvList.filter(p => 
        p.titre.toLowerCase().includes(searchTerm) ||
        p.texte.toLowerCase().includes(searchTerm) ||
        (p.lieu && p.lieu.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre par date de début
    if (filters.dateDebut) {
      const dateDebut = new Date(filters.dateDebut);
      pvList = pvList.filter(p => new Date(p.date) >= dateDebut);
    }

    // Filtre par date de fin
    if (filters.dateFin) {
      const dateFin = new Date(filters.dateFin);
      pvList = pvList.filter(p => new Date(p.date) <= dateFin);
    }

    // Tri par date décroissante par défaut
    return pvList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Crée un nouveau PV
   */
  create(pvData: Omit<PV, 'id' | 'createdAt'>): { success: boolean; pv?: PV; errors?: Record<string, string> } {
    // Validation
    const validation = validationService.validatePV(pvData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité du titre
    const existingPV = this.getAll();
    const duplicate = existingPV.find(p => 
      p.titre.toLowerCase() === pvData.titre.toLowerCase()
    );

    if (duplicate) {
      return { 
        success: false, 
        errors: { titre: 'Un PV avec ce titre existe déjà' }
      };
    }

    // Nettoyage des données
    const cleanedData = {
      ...pvData,
      titre: validationService.sanitizeString(pvData.titre),
      texte: pvData.texte.trim(),
      lieu: pvData.lieu ? validationService.sanitizeString(pvData.lieu) : undefined,
      fichiers: pvData.fichiers || []
    };

    try {
      const newPV = storageService.addPV(cleanedData);
      return { success: true, pv: newPV };
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la création du PV' } };
    }
  }

  /**
   * Met à jour un PV
   */
  update(id: ID, updates: Partial<PV>): { success: boolean; pv?: PV; errors?: Record<string, string> } {
    // Vérification de l'existence
    const existingPV = this.getById(id);
    if (!existingPV) {
      return { success: false, errors: { general: 'PV introuvable' } };
    }

    // Validation des nouvelles données
    const updatedData = { ...existingPV, ...updates };
    const validation = validationService.validatePV(updatedData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Vérification d'unicité du titre si modifié
    if (updates.titre) {
      const existingPVList = this.getAll();
      const duplicate = existingPVList.find(p => 
        p.id !== id && p.titre.toLowerCase() === updates.titre!.toLowerCase()
      );

      if (duplicate) {
        return { 
          success: false, 
          errors: { titre: 'Un PV avec ce titre existe déjà' }
        };
      }
    }

    // Nettoyage des données
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.titre) {
      cleanedUpdates.titre = validationService.sanitizeString(cleanedUpdates.titre);
    }
    if (cleanedUpdates.texte) {
      cleanedUpdates.texte = cleanedUpdates.texte.trim();
    }
    if (cleanedUpdates.lieu) {
      cleanedUpdates.lieu = validationService.sanitizeString(cleanedUpdates.lieu);
    }

    try {
      const success = storageService.updatePV(id, cleanedUpdates);
      if (success) {
        const updatedPV = this.getById(id);
        return { success: true, pv: updatedPV! };
      } else {
        return { success: false, errors: { general: 'Erreur lors de la mise à jour' } };
      }
    } catch (error) {
      return { success: false, errors: { general: 'Erreur lors de la mise à jour du PV' } };
    }
  }

  /**
   * Supprime un PV
   */
  delete(id: ID): { success: boolean; message: string } {
    const pv = this.getById(id);
    if (!pv) {
      return { success: false, message: 'PV introuvable' };
    }

    try {
      const success = storageService.deletePV(id);
      if (success) {
        return { 
          success: true, 
          message: `Le PV "${pv.titre}" a été supprimé avec succès`
        };
      } else {
        return { success: false, message: 'Erreur lors de la suppression' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la suppression du PV' };
    }
  }

  /**
   * Duplique un PV
   */
  duplicate(id: ID): { success: boolean; pv?: PV; errors?: Record<string, string> } {
    const originalPV = this.getById(id);
    if (!originalPV) {
      return { success: false, errors: { general: 'PV introuvable' } };
    }

    // Créer une copie avec un nouveau titre
    const duplicateData = {
      titre: `${originalPV.titre} (Copie)`,
      date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui
      lieu: originalPV.lieu,
      texte: originalPV.texte,
      fichiers: originalPV.fichiers ? [...originalPV.fichiers] : []
    };

    return this.create(duplicateData);
  }

  /**
   * Ajoute un fichier à un PV
   */
  async addFile(pvId: ID, file: File): Promise<{ success: boolean; message: string; fichier?: PVFichier }> {
    const pv = this.getById(pvId);
    if (!pv) {
      return { success: false, message: 'PV introuvable' };
    }

    // Validation du fichier
    const validation = validationService.validateFile(file);
    if (!validation.isValid) {
      return { success: false, message: Object.values(validation.errors)[0] };
    }

    try {
      // Conversion en base64
      const dataUrl = await this.fileToDataUrl(file);
      
      const nouveauFichier: PVFichier = {
        name: file.name,
        dataUrl,
        mime: file.type,
        size: file.size
      };

      const fichiers = [...(pv.fichiers || []), nouveauFichier];
      
      const result = this.update(pvId, { fichiers });
      
      if (result.success) {
        return { 
          success: true, 
          message: `Fichier "${file.name}" ajouté avec succès`,
          fichier: nouveauFichier
        };
      } else {
        return { success: false, message: 'Erreur lors de l\'ajout du fichier' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors du traitement du fichier' };
    }
  }

  /**
   * Supprime un fichier d'un PV
   */
  removeFile(pvId: ID, fileName: string): { success: boolean; message: string } {
    const pv = this.getById(pvId);
    if (!pv) {
      return { success: false, message: 'PV introuvable' };
    }

    const fichiers = (pv.fichiers || []).filter(f => f.name !== fileName);
    
    const result = this.update(pvId, { fichiers });
    
    if (result.success) {
      return { 
        success: true, 
        message: `Fichier "${fileName}" supprimé avec succès`
      };
    } else {
      return { success: false, message: 'Erreur lors de la suppression du fichier' };
    }
  }

  /**
   * Convertit un fichier en DataURL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Télécharge un fichier depuis un PV
   */
  downloadFile(fichier: PVFichier): void {
    try {
      const link = document.createElement('a');
      link.href = fichier.dataUrl;
      link.download = fichier.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  }

  /**
   * Obtient les statistiques des PV
   */
  getStats() {
    const pvList = this.getAll();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const pvThisYear = pvList.filter(p => 
      new Date(p.date).getFullYear() === currentYear
    );
    
    const pvThisMonth = pvList.filter(p => {
      const pvDate = new Date(p.date);
      return pvDate.getFullYear() === currentYear && pvDate.getMonth() === currentMonth;
    });

    const totalFichiers = pvList.reduce((total, pv) => 
      total + (pv.fichiers?.length || 0), 0
    );

    return {
      total: pvList.length,
      cetteAnnee: pvThisYear.length,
      ceMois: pvThisMonth.length,
      totalFichiers,
      dernierPV: pvList.length > 0 ? pvList.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] : null
    };
  }

  /**
   * Obtient les PV récents
   */
  getRecent(limit = 5): PV[] {
    return this.getAll()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Recherche dans le contenu des PV
   */
  searchInContent(searchTerm: string): PV[] {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return this.getAll().filter(pv => 
      pv.titre.toLowerCase().includes(term) ||
      pv.texte.toLowerCase().includes(term) ||
      (pv.lieu && pv.lieu.toLowerCase().includes(term))
    );
  }

  /**
   * Exporte les PV au format simple pour les exports
   */
  getForExport(): any[] {
    const pvList = this.getAll().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return pvList.map(pv => ({
      ID: pv.id,
      Titre: pv.titre,
      Date: new Date(pv.date).toLocaleDateString('fr-FR'),
      Lieu: pv.lieu || '',
      'Contenu (extrait)': pv.texte.substring(0, 200) + (pv.texte.length > 200 ? '...' : ''),
      'Nombre de fichiers': pv.fichiers?.length || 0,
      'Date création': new Date(pv.createdAt).toLocaleDateString('fr-FR'),
      'Dernière modification': pv.updatedAt ? new Date(pv.updatedAt).toLocaleDateString('fr-FR') : ''
    }));
  }

  /**
   * Obtient un PV formaté pour l'export PDF
   */
  getPVForPdfExport(id: ID): any {
    const pv = this.getById(id);
    if (!pv) return null;

    return {
      titre: pv.titre,
      date: new Date(pv.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      lieu: pv.lieu || '',
      texte: pv.texte,
      fichiers: pv.fichiers?.map(f => ({
        nom: f.name,
        taille: this.formatFileSize(f.size)
      })) || [],
      stats: {
        nombreMots: pv.texte.split(/\s+/).length,
        nombreCaracteres: pv.texte.length,
        nombreFichiers: pv.fichiers?.length || 0,
        dateCreation: new Date(pv.createdAt).toLocaleDateString('fr-FR'),
        derniereModification: pv.updatedAt ? new Date(pv.updatedAt).toLocaleDateString('fr-FR') : ''
      }
    };
  }

  /**
   * Formate la taille d'un fichier
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Valide le format d'un texte de PV
   */
  validatePVText(text: string): { isValid: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    
    // Vérifications basiques
    if (text.length < 50) {
      suggestions.push('Le contenu semble très court pour un PV');
    }
    
    if (!text.includes('Ordre du jour') && !text.includes('ordre du jour')) {
      suggestions.push('Considérez d\'ajouter un ordre du jour');
    }
    
    if (!text.includes('Présents') && !text.includes('présents')) {
      suggestions.push('Considérez d\'ajouter la liste des présents');
    }
    
    if (!text.includes('Décision') && !text.includes('décision')) {
      suggestions.push('Considérez d\'ajouter les décisions prises');
    }

    return {
      isValid: suggestions.length === 0,
      suggestions
    };
  }
}

// Instance singleton
export const pvService = new PVService();

