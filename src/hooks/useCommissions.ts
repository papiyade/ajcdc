import { useState, useCallback } from 'react';
import { Commission, CommissionAvecMembres, CommissionFilters, ID } from '../types/entities';
import { commissionsService } from '../services/commissions';
import { useApp, useToast } from '../contexts/AppContext';

/**
 * Hook pour la gestion des commissions
 */
export function useCommissions() {
  const { state, refreshData } = useApp();
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CommissionFilters>({});
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Données filtrées
  const filteredCommissions = commissionsService.search(filters);
  const commissionsAvecMembres = commissionsService.getAllWithMembres();
  const stats = commissionsService.getStats();

  // Actions CRUD
  const createCommission = useCallback(async (commissionData: Omit<Commission, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const result = commissionsService.create(commissionData);
      
      if (result.success) {
        refreshData();
        success('Commission créée', `La commission "${commissionData.nom}" a été créée avec succès`);
        return { success: true, commission: result.commission };
      } else {
        error('Erreur de création', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la création de la commission');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const updateCommission = useCallback(async (id: ID, updates: Partial<Commission>) => {
    setLoading(true);
    try {
      const result = commissionsService.update(id, updates);
      
      if (result.success) {
        refreshData();
        success('Commission modifiée', 'Les informations ont été mises à jour avec succès');
        return { success: true, commission: result.commission };
      } else {
        error('Erreur de modification', Object.values(result.errors || {}).join(', '));
        return { success: false, errors: result.errors };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la modification de la commission');
      return { success: false, errors: { general: 'Erreur technique' } };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const deleteCommission = useCallback(async (id: ID) => {
    setLoading(true);
    try {
      const result = commissionsService.delete(id);
      
      if (result.success) {
        refreshData();
        success('Commission supprimée', result.message);
        return { success: true };
      } else {
        error('Erreur de suppression', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la suppression de la commission');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  // Gestion des membres
  const addMembre = useCallback(async (commissionId: ID, membreId: ID) => {
    setLoading(true);
    try {
      const result = commissionsService.addMembre(commissionId, membreId);
      
      if (result.success) {
        refreshData();
        success('Membre ajouté', result.message);
        return { success: true };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de l\'ajout du membre');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const removeMembre = useCallback(async (commissionId: ID, membreId: ID) => {
    setLoading(true);
    try {
      const result = commissionsService.removeMembre(commissionId, membreId);
      
      if (result.success) {
        refreshData();
        success('Membre retiré', result.message);
        return { success: true };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors du retrait du membre');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const setPresident = useCallback(async (commissionId: ID, membreId: ID) => {
    setLoading(true);
    try {
      const result = commissionsService.setPresident(commissionId, membreId);
      
      if (result.success) {
        refreshData();
        success('Président nommé', result.message);
        return { success: true };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors de la nomination du président');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  const removePresident = useCallback(async (commissionId: ID) => {
    setLoading(true);
    try {
      const result = commissionsService.removePresident(commissionId);
      
      if (result.success) {
        refreshData();
        success('Président retiré', result.message);
        return { success: true };
      } else {
        error('Erreur', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      error('Erreur', 'Erreur lors du retrait du président');
      return { success: false, message: 'Erreur technique' };
    } finally {
      setLoading(false);
    }
  }, [refreshData, success, error]);

  // Utilitaires
  const getCommissionById = useCallback((id: ID): Commission | null => {
    return commissionsService.getById(id);
  }, []);

  const getCommissionAvecMembres = useCallback((id: ID): CommissionAvecMembres | null => {
    return commissionsService.getByIdWithMembres(id);
  }, []);

  const getCommissionsByMembre = useCallback((membreId: ID): Commission[] => {
    return commissionsService.getByMembre(membreId);
  }, []);

  const isPresident = useCallback((membreId: ID) => {
    return commissionsService.isPresident(membreId);
  }, []);

  // Recherche et filtrage
  const searchCommissions = useCallback((searchFilters: CommissionFilters) => {
    setFilters(searchFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sélection
  const selectCommission = useCallback((commission: Commission | null) => {
    setSelectedCommission(commission);
  }, []);

  // Export
  const exportCommissions = useCallback(() => {
    return commissionsService.getForExport();
  }, []);

  const exportCommissionDetails = useCallback((id: ID) => {
    return commissionsService.getCommissionForPdfExport(id);
  }, []);

  // Validation
  const validateCommissionData = useCallback((data: Partial<Commission>) => {
    // Validation basique côté client
    const errors: Record<string, string> = {};
    
    if (!data.nom?.trim()) {
      errors.nom = 'Le nom est obligatoire';
    }
    
    if (data.membresIds && data.presidentMembreId) {
      if (!data.membresIds.includes(data.presidentMembreId)) {
        errors.presidentMembreId = 'Le président doit faire partie des membres';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  return {
    // Données
    commissions: state.commissions,
    filteredCommissions,
    commissionsAvecMembres,
    stats,
    selectedCommission,
    
    // État
    loading,
    filters,
    
    // Actions CRUD
    createCommission,
    updateCommission,
    deleteCommission,
    
    // Gestion des membres
    addMembre,
    removeMembre,
    setPresident,
    removePresident,
    
    // Utilitaires
    getCommissionById,
    getCommissionAvecMembres,
    getCommissionsByMembre,
    isPresident,
    
    // Recherche et filtrage
    searchCommissions,
    clearFilters,
    
    // Sélection
    selectCommission,
    
    // Export
    exportCommissions,
    exportCommissionDetails,
    
    // Validation
    validateCommissionData,
    
    // Actions
    refreshData
  };
}

