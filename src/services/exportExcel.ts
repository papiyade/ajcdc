import * as XLSX from 'xlsx';
import { ExportOptions, ExportResult } from '../types/entities';
import { membresService } from './membres';
import { commissionsService } from './commissions';
import { pvService } from './pv';

/**
 * Service d'export Excel avec support UTF-8
 */

class ExportExcelService {
  /**
   * Exporte les membres en Excel
   */
  exportMembres(options: ExportOptions = { format: 'excel' }): ExportResult {
    try {
      const data = membresService.getForExport(options.includeInactifs);
      
      // Création du workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Configuration des colonnes
      const colWidths = [
        { wch: 5 },   // ID
        { wch: 15 },  // Prénom
        { wch: 15 },  // Nom
        { wch: 25 },  // Adresse
        { wch: 15 },  // Téléphone
        { wch: 10 },  // Statut
        { wch: 30 },  // Commissions
        { wch: 12 },  // Président de
        { wch: 12 },  // Date création
        { wch: 15 }   // Dernière modification
      ];
      ws['!cols'] = colWidths;

      // Ajout de la feuille
      XLSX.utils.book_append_sheet(wb, ws, 'Membres');

      // Ajout des métadonnées
      this.addMetadataSheet(wb, 'Membres', data.length);

      // Génération du fichier
      const filename = options.filename || `AJCDC_Membres_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export Excel membres:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export des membres'
      };
    }
  }

  /**
   * Exporte les commissions en Excel
   */
  exportCommissions(options: ExportOptions = { format: 'excel' }): ExportResult {
    try {
      const data = commissionsService.getForExport();
      
      // Création du workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Configuration des colonnes
      const colWidths = [
        { wch: 5 },   // ID
        { wch: 25 },  // Nom
        { wch: 30 },  // Description
        { wch: 12 },  // Nombre de membres
        { wch: 20 },  // Président(e)
        { wch: 40 },  // Membres
        { wch: 12 },  // Date création
        { wch: 15 }   // Dernière modification
      ];
      ws['!cols'] = colWidths;

      // Ajout de la feuille
      XLSX.utils.book_append_sheet(wb, ws, 'Commissions');

      // Ajout des métadonnées
      this.addMetadataSheet(wb, 'Commissions', data.length);

      // Génération du fichier
      const filename = options.filename || `AJCDC_Commissions_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export Excel commissions:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export des commissions'
      };
    }
  }

  /**
   * Exporte les PV en Excel
   */
  exportPV(options: ExportOptions = { format: 'excel' }): ExportResult {
    try {
      const data = pvService.getForExport();
      
      // Création du workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Configuration des colonnes
      const colWidths = [
        { wch: 5 },   // ID
        { wch: 30 },  // Titre
        { wch: 12 },  // Date
        { wch: 20 },  // Lieu
        { wch: 50 },  // Contenu (extrait)
        { wch: 12 },  // Nombre de fichiers
        { wch: 12 },  // Date création
        { wch: 15 }   // Dernière modification
      ];
      ws['!cols'] = colWidths;

      // Ajout de la feuille
      XLSX.utils.book_append_sheet(wb, ws, 'Procès-Verbaux');

      // Ajout des métadonnées
      this.addMetadataSheet(wb, 'Procès-Verbaux', data.length);

      // Génération du fichier
      const filename = options.filename || `AJCDC_PV_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export Excel PV:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export des PV'
      };
    }
  }

  /**
   * Exporte une commission spécifique avec ses membres
   */
  exportCommissionDetails(commissionId: number, options: ExportOptions = { format: 'excel' }): ExportResult {
    try {
      const commission = commissionsService.getCommissionForPdfExport(commissionId);
      if (!commission) {
        return {
          success: false,
          filename: '',
          error: 'Commission introuvable'
        };
      }

      // Création du workbook
      const wb = XLSX.utils.book_new();

      // Feuille informations générales
      const infoData = [
        { Propriété: 'Nom', Valeur: commission.nom },
        { Propriété: 'Description', Valeur: commission.description },
        { Propriété: 'Président(e)', Valeur: commission.president?.nom || 'Aucun' },
        { Propriété: 'Nombre de membres', Valeur: commission.stats.totalMembres },
        { Propriété: 'Membres actifs', Valeur: commission.stats.membresActifs },
        { Propriété: 'Date de création', Valeur: commission.stats.dateCreation },
        { Propriété: 'Dernière modification', Valeur: commission.stats.derniereModification }
      ];
      const infoWs = XLSX.utils.json_to_sheet(infoData);
      infoWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, infoWs, 'Informations');

      // Feuille membres
      const membresData = commission.membres.map((membre, index) => ({
        '#': index + 1,
        Nom: membre.nom,
        Téléphone: membre.telephone,
        Adresse: membre.adresse,
        Statut: membre.statut,
        Rôle: commission.president?.nom === membre.nom ? 'Président(e)' : 'Membre'
      }));
      const membresWs = XLSX.utils.json_to_sheet(membresData);
      membresWs['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, membresWs, 'Membres');

      // Génération du fichier
      const filename = options.filename || `AJCDC_Commission_${commission.nom.replace(/[^a-zA-Z0-9]/g, '_')}_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export Excel commission:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export de la commission'
      };
    }
  }

  /**
   * Exporte toutes les données en un seul fichier
   */
  exportAll(options: ExportOptions = { format: 'excel' }): ExportResult {
    try {
      const wb = XLSX.utils.book_new();

      // Feuille membres
      const membresData = membresService.getForExport(options.includeInactifs);
      const membresWs = XLSX.utils.json_to_sheet(membresData);
      XLSX.utils.book_append_sheet(wb, membresWs, 'Membres');

      // Feuille commissions
      const commissionsData = commissionsService.getForExport();
      const commissionsWs = XLSX.utils.json_to_sheet(commissionsData);
      XLSX.utils.book_append_sheet(wb, commissionsWs, 'Commissions');

      // Feuille PV
      const pvData = pvService.getForExport();
      const pvWs = XLSX.utils.json_to_sheet(pvData);
      XLSX.utils.book_append_sheet(wb, pvWs, 'Procès-Verbaux');

      // Feuille statistiques
      const statsData = this.getGlobalStats();
      const statsWs = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsWs, 'Statistiques');

      // Ajout des métadonnées
      this.addMetadataSheet(wb, 'Export complet', membresData.length + commissionsData.length + pvData.length);

      // Génération du fichier
      const filename = options.filename || `AJCDC_Export_Complet_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export Excel complet:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export complet'
      };
    }
  }

  /**
   * Ajoute une feuille de métadonnées
   */
  private addMetadataSheet(wb: XLSX.WorkBook, type: string, recordCount: number): void {
    const metadata = [
      { Propriété: 'Organisation', Valeur: 'Association des Jeunes de la Cité CDC de Bambilor' },
      { Propriété: 'Type d\'export', Valeur: type },
      { Propriété: 'Date d\'export', Valeur: new Date().toLocaleString('fr-FR') },
      { Propriété: 'Nombre d\'enregistrements', Valeur: recordCount },
      { Propriété: 'Version application', Valeur: '1.0.0' },
      { Propriété: 'Format', Valeur: 'Excel (.xlsx)' },
      { Propriété: 'Encodage', Valeur: 'UTF-8' }
    ];

    const ws = XLSX.utils.json_to_sheet(metadata);
    ws['!cols'] = [{ wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Métadonnées');
  }

  /**
   * Obtient les statistiques globales
   */
  private getGlobalStats(): any[] {
    const membresStats = membresService.getStats();
    const commissionsStats = commissionsService.getStats();
    const pvStats = pvService.getStats();

    return [
      { Catégorie: 'Membres', Métrique: 'Total', Valeur: membresStats.total },
      { Catégorie: 'Membres', Métrique: 'Actifs', Valeur: membresStats.actifs },
      { Catégorie: 'Membres', Métrique: 'Inactifs', Valeur: membresStats.inactifs },
      { Catégorie: 'Membres', Métrique: 'Avec commission', Valeur: membresStats.avecCommission },
      { Catégorie: 'Membres', Métrique: 'Sans commission', Valeur: membresStats.sansCommission },
      { Catégorie: 'Membres', Métrique: 'Présidents', Valeur: membresStats.presidents },
      
      { Catégorie: 'Commissions', Métrique: 'Total', Valeur: commissionsStats.total },
      { Catégorie: 'Commissions', Métrique: 'Avec président', Valeur: commissionsStats.avecPresident },
      { Catégorie: 'Commissions', Métrique: 'Sans président', Valeur: commissionsStats.sansPresident },
      { Catégorie: 'Commissions', Métrique: 'Total membres affectés', Valeur: commissionsStats.totalMembresAffectes },
      { Catégorie: 'Commissions', Métrique: 'Moyenne membres/commission', Valeur: commissionsStats.moyenneMembresParCommission },
      
      { Catégorie: 'PV', Métrique: 'Total', Valeur: pvStats.total },
      { Catégorie: 'PV', Métrique: 'Cette année', Valeur: pvStats.cetteAnnee },
      { Catégorie: 'PV', Métrique: 'Ce mois', Valeur: pvStats.ceMois },
      { Catégorie: 'PV', Métrique: 'Total fichiers joints', Valeur: pvStats.totalFichiers }
    ];
  }

  /**
   * Génère une chaîne de date pour les noms de fichiers
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Vérifie si l'export Excel est supporté par le navigateur
   */
  isSupported(): boolean {
    try {
      return typeof XLSX !== 'undefined' && typeof XLSX.writeFile === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Obtient les formats d'export supportés
   */
  getSupportedFormats(): string[] {
    return ['xlsx', 'csv', 'ods'];
  }

  /**
   * Exporte au format CSV (alternative légère)
   */
  exportToCSV(data: any[], filename: string): ExportResult {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      // Création du blob avec BOM UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      
      // Téléchargement
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export CSV:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export CSV'
      };
    }
  }
}

// Instance singleton
export const exportExcelService = new ExportExcelService();

