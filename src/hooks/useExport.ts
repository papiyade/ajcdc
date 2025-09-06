import { useState, useCallback } from 'react';
import { ExportOptions, ExportResult } from '../types/entities';
import { exportExcelService } from '../services/exportExcel';
import { exportPdfService } from '../services/exportPdf';
import { useToast } from '../contexts/AppContext';

/**
 * Hook pour la gestion des exports
 */
export function useExport() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Export Excel
  const exportMembresExcel = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportMembres(options);
      
      if (result.success) {
        success('Export réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportCommissionsExcel = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportCommissions(options);
      
      if (result.success) {
        success('Export réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportPVExcel = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportPV(options);
      
      if (result.success) {
        success('Export réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportCommissionDetailsExcel = useCallback(async (commissionId: number, options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportCommissionDetails(commissionId, options);
      
      if (result.success) {
        success('Export réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportAllExcel = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportAll(options);
      
      if (result.success) {
        success('Export complet réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export complet'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // Export PDF
  const exportMembresPdf = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportPdfService.exportMembres(options);
      
      if (result.success) {
        success('Export PDF réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export PDF', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export PDF'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportCommissionsPdf = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportPdfService.exportCommissions(options);
      
      if (result.success) {
        success('Export PDF réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export PDF', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export PDF'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportPVOfficielPdf = useCallback(async (pvId: number, options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportPdfService.exportPVOfficiel(pvId, options);
      
      if (result.success) {
        success('Export PV officiel réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export PV', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export du PV'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportCommissionDetailsPdf = useCallback(async (commissionId: number, options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportPdfService.exportCommissionDetails(commissionId, options);
      
      if (result.success) {
        success('Export commission réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export commission', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export de la commission'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  const exportRapportCompletPdf = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportPdfService.exportRapportComplet(options);
      
      if (result.success) {
        success('Rapport complet généré', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur de génération', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de la génération du rapport'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // Export CSV (alternative légère)
  const exportToCSV = useCallback(async (data: any[], filename: string): Promise<ExportResult> => {
    setLoading(true);
    try {
      const result = exportExcelService.exportToCSV(data, filename);
      
      if (result.success) {
        success('Export CSV réussi', `Fichier ${result.filename} téléchargé`);
      } else {
        error('Erreur d\'export CSV', result.error || 'Erreur inconnue');
      }
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        filename: '',
        error: 'Erreur technique lors de l\'export CSV'
      };
      error('Erreur', errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // Utilitaires
  const isExcelSupported = useCallback(() => {
    return exportExcelService.isSupported();
  }, []);

  const isPdfSupported = useCallback(() => {
    return exportPdfService.isSupported();
  }, []);

  const getSupportedFormats = useCallback(() => {
    return exportExcelService.getSupportedFormats();
  }, []);

  const getPdfExportOptions = useCallback(() => {
    return exportPdfService.getExportOptions();
  }, []);

  // Export générique
  const exportData = useCallback(async (
    type: 'membres' | 'commissions' | 'pv' | 'commission-details' | 'pv-officiel' | 'rapport-complet',
    format: 'excel' | 'pdf' | 'csv',
    options?: ExportOptions & { id?: number }
  ): Promise<ExportResult> => {
    const exportOptions = { format, ...options };

    switch (type) {
      case 'membres':
        return format === 'pdf' ? exportMembresPdf(exportOptions) : exportMembresExcel(exportOptions);
      
      case 'commissions':
        return format === 'pdf' ? exportCommissionsPdf(exportOptions) : exportCommissionsExcel(exportOptions);
      
      case 'pv':
        return exportPVExcel(exportOptions);
      
      case 'commission-details':
        if (!options?.id) throw new Error('ID de commission requis');
        return format === 'pdf' 
          ? exportCommissionDetailsPdf(options.id, exportOptions)
          : exportCommissionDetailsExcel(options.id, exportOptions);
      
      case 'pv-officiel':
        if (!options?.id) throw new Error('ID de PV requis');
        return exportPVOfficielPdf(options.id, exportOptions);
      
      case 'rapport-complet':
        return exportRapportCompletPdf(exportOptions);
      
      default:
        throw new Error('Type d\'export non supporté');
    }
  }, [
    exportMembresExcel, exportMembresPdf,
    exportCommissionsExcel, exportCommissionsPdf,
    exportPVExcel, exportPVOfficielPdf,
    exportCommissionDetailsExcel, exportCommissionDetailsPdf,
    exportRapportCompletPdf
  ]);

  return {
    // État
    loading,
    
    // Export Excel
    exportMembresExcel,
    exportCommissionsExcel,
    exportPVExcel,
    exportCommissionDetailsExcel,
    exportAllExcel,
    
    // Export PDF
    exportMembresPdf,
    exportCommissionsPdf,
    exportPVOfficielPdf,
    exportCommissionDetailsPdf,
    exportRapportCompletPdf,
    
    // Export CSV
    exportToCSV,
    
    // Export générique
    exportData,
    
    // Utilitaires
    isExcelSupported,
    isPdfSupported,
    getSupportedFormats,
    getPdfExportOptions
  };
}

