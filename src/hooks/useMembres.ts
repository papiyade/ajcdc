import { useState, useEffect, useCallback } from 'react';
import { Membre, MembreAvecCommissions, MembreFilters, ID } from '../types/entities';
import { membresService } from '../services/membres';
import { useApp, useToast } from '../contexts/AppContext';

/**
 * Hook pour la gestion des membres
 */
export function useMembres() {
  const { state, refreshData } = useApp();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MembreFilters>({});
  const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null);

  // Données filtrées
  const filteredMembres = membresService.search(filters);
  const membresAvecCommissions = membresService.getAllWithCommissions();
  const stats = membresService.getStats();

  // Actions CRUD
  const createMembre = useCallback(async (membreData: Omit<Membre, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const result = membresService.create(membreData);
      
      if (result.success) {
        refreshData();
        success('Membre créé', `${membreData.prenom} ${membreData.nom} a été ajouté avec succès`);
        return { success: true, membre: result.membre };
      } else {
        error('Erreur de création', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la création du membre');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const updateMembre = useCallback(async (id: ID, updates: Partial<Membre>) => {
    setLoading(true);
    try {
      const result = membresService.update(id, updates);
      
      if (result.success) {
        refreshData();
        success('Membre modifié', 'Les informations ont été mises à jour avec succès');
        return { success: true, membre: result.membre };
      } else {
        error('Erreur de modification', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la modification du membre');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const deleteMembre = useCallback(async (id: ID) => {
    setLoading(true);
    try {
      const result = membresService.delete(id);
      
      if (result.success) {
        refreshData();
        success('Membre supprimé', result.message);
        return { success: true };
      } else {
        error('Erreur de suppression', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la suppression du membre');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const toggleActive = useCallback(async (id: ID) => {
    setLoading(true);
    try {
      const result = membresService.toggleActive(id);
      
      if (result.success) {
        refreshData();
        success('Statut modifié', result.message);
        return { success: true, membre: result.membre };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors du changement de statut');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  // Utilitaires
  const getMembreById = useCallback((id: ID): Membre | null => {
    return membresService.getById(id);
  }, []);

  const getMembreAvecCommissions = useCallback((id: ID): MembreAvecCommissions | null => {
    return membresAvecCommissions.find(m => m.id === id) || null;
  }, [membresAvecCommissions]);

  const getAvailableForCommission = useCallback((excludeCommissionId?: ID): Membre[] => {
    return membresService.getAvailableForCommission(excludeCommissionId);
  }, []);

  // Recherche et filtrage
  const searchMembres = useCallback((searchFilters: MembreFilters) => {
    setFilters(searchFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sélection
  const selectMembre = useCallback((membre: Membre | null) => {
    setSelectedMembre(membre);
  }, []);

  // Export
  const exportMembres = useCallback((includeInactifs = false) => {
    return membresService.getForExport(includeInactifs);
  }, []);

  return {
    // Données
    membres: state.membres,
    filteredMembres,
    membresAvecCommissions,
    stats,
    selectedMembre,
    
    // État
    loading,
    filters,
    
    // Actions CRUD
    createMembre,
    updateMembre,
    deleteMembre,
    toggleActive,
    
    // Utilitaires
    getMembreById,
    getMembreAvecCommissions,
    getAvailableForCommission,
    
    // Recherche et filtrage
    searchMembres,
    clearFilters,
    
    // Sélection
    selectMembre,
    
    // Export
    exportMembres,
    
    // Actions
    refreshData
  };
}

