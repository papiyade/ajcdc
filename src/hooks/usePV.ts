import { useState, useCallback } from 'react';
import { PV, PVFilters, PVFichier, ID } from '../types/entities';
import { pvService } from '../services/pv';
import { useApp, useToast } from '../contexts/AppContext';

/**
 * Hook pour la gestion des procès-verbaux
 */
export function usePV() {
  const { state, refreshData } = useApp();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PVFilters>({});
  const [selectedPV, setSelectedPV] = useState<PV | null>(null);

  // Données filtrées
  const filteredPV = pvService.search(filters);
  const recentPV = pvService.getRecent(5);
  const stats = pvService.getStats();

  // Actions CRUD
  const createPV = useCallback(async (pvData: Omit<PV, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const result = pvService.create(pvData);
      
      if (result.success) {
        refreshData();
        success('PV créé', `Le PV "${pvData.titre}" a été créé avec succès`);
        return { success: true, pv: result.pv };
      } else {
        error('Erreur de création', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la création du PV');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const updatePV = useCallback(async (id: ID, updates: Partial<PV>) => {
    setLoading(true);
    try {
      const result = pvService.update(id, updates);
      
      if (result.success) {
        refreshData();
        success('PV modifié', 'Le PV a été mis à jour avec succès');
        return { success: true, pv: result.pv };
      } else {
        error('Erreur de modification', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la modification du PV');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const deletePV = useCallback(async (id: ID) => {
    setLoading(true);
    try {
      const result = pvService.delete(id);
      
      if (result.success) {
        refreshData();
        success('PV supprimé', result.message);
        return { success: true };
      } else {
        error('Erreur de suppression', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la suppression du PV');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const duplicatePV = useCallback(async (id: ID) => {
    setLoading(true);
    try {
      const result = pvService.duplicate(id);
      
      if (result.success) {
        refreshData();
        success('PV dupliqué', 'Le PV a été dupliqué avec succès');
        return { success: true, pv: result.pv };
      } else {
        error('Erreur de duplication', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la duplication du PV');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  // Gestion des fichiers
  const addFile = useCallback(async (pvId: ID, file: File) => {
    setLoading(true);
    try {
      const result = await pvService.addFile(pvId, file);
      
      if (result.success) {
        refreshData();
        success('Fichier ajouté', result.message);
        return { success: true, fichier: result.fichier };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de l\'ajout du fichier');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const removeFile = useCallback(async (pvId: ID, fileName: string) => {
    setLoading(true);
    try {
      const result = pvService.removeFile(pvId, fileName);
      
      if (result.success) {
        refreshData();
        success('Fichier supprimé', result.message);
        return { success: true };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la suppression du fichier');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const downloadFile = useCallback((fichier: PVFichier) => {
    try {
      pvService.downloadFile(fichier);
      success('Téléchargement', `Téléchargement de ${fichier.name} en cours`);
    } catch (err) {
      error('Erreur', 'Erreur lors du téléchargement du fichier');
    }
  }, [success, error]);

  // Utilitaires
  const getPVById = useCallback((id: ID): PV | null => {
    return pvService.getById(id);
  }, []);

  const searchInContent = useCallback((searchTerm: string): PV[] => {
    return pvService.searchInContent(searchTerm);
  }, []);

  const validatePVText = useCallback((text: string) => {
    return pvService.validatePVText(text);
  }, []);

  // Recherche et filtrage
  const searchPV = useCallback((searchFilters: PVFilters) => {
    setFilters(searchFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sélection
  const selectPV = useCallback((pv: PV | null) => {
    setSelectedPV(pv);
  }, []);

  // Export
  const exportPV = useCallback(() => {
    return pvService.getForExport();
  }, []);

  const exportPVForPdf = useCallback((id: ID) => {
    return pvService.getPVForPdfExport(id);
  }, []);

  // Validation
  const validatePVData = useCallback((data: Partial<PV>) => {
    // Validation basique côté client
    const errors: Record<string, string> = {};
    
    if (!data.titre?.trim()) {
      errors.titre = 'Le titre est obligatoire';
    }
    
    if (!data.date) {
      errors.date = 'La date est obligatoire';
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.date = 'Format de date invalide';
      } else if (date > new Date()) {
        errors.date = 'La date ne peut pas être dans le futur';
      }
    }
    
    if (!data.texte?.trim()) {
      errors.texte = 'Le contenu est obligatoire';
    } else if (data.texte.trim().length < 10) {
      errors.texte = 'Le contenu doit contenir au moins 10 caractères';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Statistiques et analyses
  const getWordCount = useCallback((text: string): number => {
    return text.trim().split(/\s+/).length;
  }, []);

  const getCharacterCount = useCallback((text: string): number => {
    return text.length;
  }, []);

  const getReadingTime = useCallback((text: string): number => {
    const wordsPerMinute = 200; // Vitesse de lecture moyenne
    const wordCount = getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }, [getWordCount]);

  // Templates et suggestions
  const getPVTemplate = useCallback(() => {
    return `PROCÈS-VERBAL DE RÉUNION

Date : [Date de la réunion]
Lieu : [Lieu de la réunion]
Heure : [Heure de début] - [Heure de fin]

PRÉSENTS :
- [Nom et fonction des présents]

ABSENTS EXCUSÉS :
- [Nom des absents excusés]

ORDRE DU JOUR :
1. [Point 1]
2. [Point 2]
3. [Point 3]

DÉROULEMENT :

1. OUVERTURE DE LA SÉANCE
[Description de l'ouverture]

2. APPROBATION DU PV PRÉCÉDENT
[Statut d'approbation]

3. POINTS À L'ORDRE DU JOUR

Point 1 : [Titre du point]
[Discussion et décisions]

Point 2 : [Titre du point]
[Discussion et décisions]

Point 3 : [Titre du point]
[Discussion et décisions]

4. QUESTIONS DIVERSES
[Autres points abordés]

5. PROCHAINE RÉUNION
Date : [Date de la prochaine réunion]
Lieu : [Lieu de la prochaine réunion]

6. CLÔTURE DE LA SÉANCE
La séance est levée à [Heure de fin].

Le Secrétaire,
[Nom du secrétaire]`;
  }, []);

  return {
    // Données
    pv: state.pv,
    filteredPV,
    recentPV,
    stats,
    selectedPV,
    
    // État
    loading,
    filters,
    
    // Actions CRUD
    createPV,
    updatePV,
    deletePV,
    duplicatePV,
    
    // Gestion des fichiers
    addFile,
    removeFile,
    downloadFile,
    
    // Utilitaires
    getPVById,
    searchInContent,
    validatePVText,
    
    // Recherche et filtrage
    searchPV,
    clearFilters,
    
    // Sélection
    selectPV,
    
    // Export
    exportPV,
    exportPVForPdf,
    
    // Validation
    validatePVData,
    
    // Statistiques et analyses
    getWordCount,
    getCharacterCount,
    getReadingTime,
    
    // Templates
    getPVTemplate,
    
    // Actions
    refreshData
  };
}

