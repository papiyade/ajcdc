import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportOptions, ExportResult } from '../types/entities';
import { membresService } from './membres';
import { commissionsService } from './commissions';
import { pvService } from './pv';

/**
 * Service d'export PDF avec support UTF-8 et mise en page AJCDC
 */

class ExportPdfService {
  private readonly COLORS = {
    primary: '#C9A227',
    greenaj: '#1B5E20',
    redaj: '#8B1E1E',
    bicblue: '#003399',
    text: '#374151',
    lightGray: '#F5F5F5'
  };

  private readonly FONTS = {
    title: 16,
    subtitle: 14,
    normal: 10,
    small: 8
  };

  /**
   * Configure le document PDF avec les styles AJCDC
   */
  private setupDocument(doc: jsPDF, title: string): void {
    // En-tête AJCDC
    doc.setFillColor(this.COLORS.primary);
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(this.FONTS.title);
    doc.text('Association des Jeunes de la Cité CDC de Bambilor', 20, 15);
    
    doc.setFontSize(this.FONTS.subtitle);
    doc.text(title, 20, 35);
    
    // Informations d'export
    doc.setTextColor(this.COLORS.text);
    doc.setFontSize(this.FONTS.small);
    const dateExport = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Généré le ${dateExport}`, 20, 45);
  }

  /**
   * Ajoute un pied de page
   */
  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Ligne de séparation
      doc.setDrawColor(this.COLORS.primary);
      doc.line(20, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
      
      // Numéro de page
      doc.setTextColor(this.COLORS.text);
      doc.setFontSize(this.FONTS.small);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
      
      // Nom de l'organisation
      doc.text('AJCDC - Gestion', 20, doc.internal.pageSize.height - 10);
    }
  }

  /**
   * Exporte les membres en PDF
   */
  exportMembres(options: ExportOptions = { format: 'pdf' }): ExportResult {
    try {
      const doc = new jsPDF();
      this.setupDocument(doc, 'Liste des Membres');
      
      const data = membresService.getForExport(options.includeInactifs);
      const stats = membresService.getStats();
      
      // Statistiques
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      let yPos = 60;
      
      doc.text(`Total des membres : ${stats.total}`, 20, yPos);
      doc.text(`Membres actifs : ${stats.actifs}`, 20, yPos + 10);
      doc.text(`Membres inactifs : ${stats.inactifs}`, 20, yPos + 20);
      doc.text(`Avec commission : ${stats.avecCommission}`, 120, yPos);
      doc.text(`Sans commission : ${stats.sansCommission}`, 120, yPos + 10);
      doc.text(`Présidents : ${stats.presidents}`, 120, yPos + 20);
      
      // Tableau des membres
      const tableData = data.map(membre => [
        membre.ID,
        membre.Prénom,
        membre.Nom,
        membre.Téléphone,
        membre.Statut,
        membre['Président de'] === 'Oui' ? '★' : ''
      ]);

      autoTable(doc, {
        head: [['ID', 'Prénom', 'Nom', 'Téléphone', 'Statut', 'Président']],
        body: tableData,
        startY: yPos + 35,
        styles: {
          fontSize: this.FONTS.small,
          cellPadding: 3
        },
        headStyles: {
          fillColor: this.COLORS.primary,
          textColor: 255,
          fontSize: this.FONTS.normal
        },
        alternateRowStyles: {
          fillColor: this.COLORS.lightGray
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20, halign: 'center' }
        }
      });

      this.addFooter(doc);
      
      const filename = options.filename || `AJCDC_Membres_${this.getDateString()}.pdf`;
      doc.save(filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export PDF membres:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export PDF des membres'
      };
    }
  }

  /**
   * Exporte les commissions en PDF
   */
  exportCommissions(options: ExportOptions = { format: 'pdf' }): ExportResult {
    try {
      const doc = new jsPDF();
      this.setupDocument(doc, 'Liste des Commissions');
      
      const data = commissionsService.getForExport();
      const stats = commissionsService.getStats();
      
      // Statistiques
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      let yPos = 60;
      
      doc.text(`Total des commissions : ${stats.total}`, 20, yPos);
      doc.text(`Avec président : ${stats.avecPresident}`, 20, yPos + 10);
      doc.text(`Sans président : ${stats.sansPresident}`, 20, yPos + 20);
      doc.text(`Total membres affectés : ${stats.totalMembresAffectes}`, 120, yPos);
      doc.text(`Moyenne membres/commission : ${stats.moyenneMembresParCommission}`, 120, yPos + 10);
      
      // Tableau des commissions
      const tableData = data.map(commission => [
        commission.ID,
        commission.Nom,
        commission['Nombre de membres'],
        commission['Président(e)'] || 'Aucun',
        commission.Description.substring(0, 50) + (commission.Description.length > 50 ? '...' : '')
      ]);

      autoTable(doc, {
        head: [['ID', 'Nom', 'Membres', 'Président(e)', 'Description']],
        body: tableData,
        startY: yPos + 35,
        styles: {
          fontSize: this.FONTS.small,
          cellPadding: 3
        },
        headStyles: {
          fillColor: this.COLORS.greenaj,
          textColor: 255,
          fontSize: this.FONTS.normal
        },
        alternateRowStyles: {
          fillColor: this.COLORS.lightGray
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 35 },
          4: { cellWidth: 60 }
        }
      });

      this.addFooter(doc);
      
      const filename = options.filename || `AJCDC_Commissions_${this.getDateString()}.pdf`;
      doc.save(filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export PDF commissions:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export PDF des commissions'
      };
    }
  }

  /**
   * Exporte un PV en PDF officiel
   */
  exportPVOfficiel(pvId: number, options: ExportOptions = { format: 'pdf' }): ExportResult {
    try {
      const pvData = pvService.getPVForPdfExport(pvId);
      if (!pvData) {
        return {
          success: false,
          filename: '',
          error: 'PV introuvable'
        };
      }

      const doc = new jsPDF();
      this.setupDocument(doc, 'Procès-Verbal Officiel');
      
      let yPos = 60;
      
      // Titre du PV
      doc.setFontSize(this.FONTS.subtitle);
      doc.setTextColor(this.COLORS.bicblue);
      doc.text(pvData.titre, 20, yPos);
      yPos += 15;
      
      // Informations du PV
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      doc.text(`Date : ${pvData.date}`, 20, yPos);
      if (pvData.lieu) {
        doc.text(`Lieu : ${pvData.lieu}`, 120, yPos);
      }
      yPos += 20;
      
      // Contenu du PV
      doc.setFontSize(this.FONTS.normal);
      const splitText = doc.splitTextToSize(pvData.texte, 170);
      doc.text(splitText, 20, yPos);
      
      // Calculer la position après le texte
      yPos += splitText.length * 5 + 20;
      
      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = 30;
      }
      
      // Fichiers joints (si présents)
      if (pvData.fichiers.length > 0) {
        doc.setFontSize(this.FONTS.subtitle);
        doc.setTextColor(this.COLORS.greenaj);
        doc.text('Pièces jointes :', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(this.FONTS.normal);
        doc.setTextColor(this.COLORS.text);
        pvData.fichiers.forEach((fichier: any) => {
          doc.text(`• ${fichier.nom} (${fichier.taille})`, 25, yPos);
          yPos += 8;
        });
        yPos += 10;
      }
      
      // Statistiques du PV
      if (yPos > doc.internal.pageSize.height - 80) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(this.FONTS.small);
      doc.setTextColor(this.COLORS.text);
      doc.text(`Nombre de mots : ${pvData.stats.nombreMots}`, 20, yPos);
      doc.text(`Nombre de caractères : ${pvData.stats.nombreCaracteres}`, 120, yPos);
      yPos += 8;
      doc.text(`Date de création : ${pvData.stats.dateCreation}`, 20, yPos);
      if (pvData.stats.derniereModification) {
        doc.text(`Dernière modification : ${pvData.stats.derniereModification}`, 120, yPos);
      }

      this.addFooter(doc);
      
      const filename = options.filename || `AJCDC_PV_${pvData.titre.replace(/[^a-zA-Z0-9]/g, '_')}_${this.getDateString()}.pdf`;
      doc.save(filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export PDF PV:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export PDF du PV'
      };
    }
  }

  /**
   * Exporte une commission détaillée en PDF
   */
  exportCommissionDetails(commissionId: number, options: ExportOptions = { format: 'pdf' }): ExportResult {
    try {
      const commission = commissionsService.getCommissionForPdfExport(commissionId);
      if (!commission) {
        return {
          success: false,
          filename: '',
          error: 'Commission introuvable'
        };
      }

      const doc = new jsPDF();
      this.setupDocument(doc, `Commission : ${commission.nom}`);
      
      let yPos = 60;
      
      // Informations générales
      doc.setFontSize(this.FONTS.subtitle);
      doc.setTextColor(this.COLORS.greenaj);
      doc.text('Informations générales', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      doc.text(`Nom : ${commission.nom}`, 20, yPos);
      yPos += 10;
      
      if (commission.description) {
        const descSplit = doc.splitTextToSize(`Description : ${commission.description}`, 170);
        doc.text(descSplit, 20, yPos);
        yPos += descSplit.length * 5 + 5;
      }
      
      if (commission.president) {
        doc.text(`Président(e) : ${commission.president.nom}`, 20, yPos);
        if (commission.president.telephone) {
          doc.text(`Téléphone : ${commission.president.telephone}`, 120, yPos);
        }
        yPos += 10;
        if (commission.president.adresse) {
          doc.text(`Adresse : ${commission.president.adresse}`, 20, yPos);
          yPos += 10;
        }
      }
      
      yPos += 10;
      
      // Statistiques
      doc.setFontSize(this.FONTS.subtitle);
      doc.setTextColor(this.COLORS.bicblue);
      doc.text('Statistiques', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      doc.text(`Total des membres : ${commission.stats.totalMembres}`, 20, yPos);
      doc.text(`Membres actifs : ${commission.stats.membresActifs}`, 120, yPos);
      yPos += 10;
      doc.text(`Date de création : ${commission.stats.dateCreation}`, 20, yPos);
      if (commission.stats.derniereModification) {
        doc.text(`Dernière modification : ${commission.stats.derniereModification}`, 120, yPos);
      }
      yPos += 20;
      
      // Liste des membres
      if (commission.membres.length > 0) {
        doc.setFontSize(this.FONTS.subtitle);
        doc.setTextColor(this.COLORS.greenaj);
        doc.text('Liste des membres', 20, yPos);
        yPos += 10;
        
        const tableData = commission.membres.map((membre: any, index: number) => [
          index + 1,
          membre.nom,
          membre.telephone || '',
          membre.statut,
          commission.president?.nom === membre.nom ? '★' : ''
        ]);

        autoTable(doc, {
          head: [['#', 'Nom', 'Téléphone', 'Statut', 'Président']],
          body: tableData,
          startY: yPos,
          styles: {
            fontSize: this.FONTS.small,
            cellPadding: 3
          },
          headStyles: {
            fillColor: this.COLORS.greenaj,
            textColor: 255,
            fontSize: this.FONTS.normal
          },
          alternateRowStyles: {
            fillColor: this.COLORS.lightGray
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' }
          }
        });
      }

      this.addFooter(doc);
      
      const filename = options.filename || `AJCDC_Commission_${commission.nom.replace(/[^a-zA-Z0-9]/g, '_')}_${this.getDateString()}.pdf`;
      doc.save(filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export PDF commission:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export PDF de la commission'
      };
    }
  }

  /**
   * Génère un rapport complet en PDF
   */
  exportRapportComplet(options: ExportOptions = { format: 'pdf' }): ExportResult {
    try {
      const doc = new jsPDF();
      this.setupDocument(doc, 'Rapport Complet AJCDC');
      
      let yPos = 60;
      
      // Résumé exécutif
      doc.setFontSize(this.FONTS.subtitle);
      doc.setTextColor(this.COLORS.bicblue);
      doc.text('Résumé Exécutif', 20, yPos);
      yPos += 15;
      
      const membresStats = membresService.getStats();
      const commissionsStats = commissionsService.getStats();
      const pvStats = pvService.getStats();
      
      doc.setFontSize(this.FONTS.normal);
      doc.setTextColor(this.COLORS.text);
      
      // Statistiques générales
      const statsData = [
        ['Membres', 'Total', membresStats.total.toString()],
        ['Membres', 'Actifs', membresStats.actifs.toString()],
        ['Membres', 'Avec commission', membresStats.avecCommission.toString()],
        ['Commissions', 'Total', commissionsStats.total.toString()],
        ['Commissions', 'Avec président', commissionsStats.avecPresident.toString()],
        ['PV', 'Total', pvStats.total.toString()],
        ['PV', 'Cette année', pvStats.cetteAnnee.toString()],
        ['PV', 'Ce mois', pvStats.ceMois.toString()]
      ];

      autoTable(doc, {
        head: [['Catégorie', 'Métrique', 'Valeur']],
        body: statsData,
        startY: yPos,
        styles: {
          fontSize: this.FONTS.small,
          cellPadding: 3
        },
        headStyles: {
          fillColor: this.COLORS.bicblue,
          textColor: 255,
          fontSize: this.FONTS.normal
        },
        alternateRowStyles: {
          fillColor: this.COLORS.lightGray
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: 'center' }
        }
      });

      this.addFooter(doc);
      
      const filename = options.filename || `AJCDC_Rapport_Complet_${this.getDateString()}.pdf`;
      doc.save(filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Erreur export PDF rapport:', error);
      return {
        success: false,
        filename: '',
        error: 'Erreur lors de l\'export du rapport complet'
      };
    }
  }

  /**
   * Génère une chaîne de date pour les noms de fichiers
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Vérifie si l'export PDF est supporté par le navigateur
   */
  isSupported(): boolean {
    try {
      return typeof jsPDF !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Obtient les options d'export PDF disponibles
   */
  getExportOptions(): { key: string; label: string; description: string }[] {
    return [
      {
        key: 'membres',
        label: 'Liste des membres',
        description: 'Export de tous les membres avec leurs informations'
      },
      {
        key: 'commissions',
        label: 'Liste des commissions',
        description: 'Export de toutes les commissions avec leurs membres'
      },
      {
        key: 'pv',
        label: 'Procès-verbal officiel',
        description: 'Export d\'un PV au format officiel'
      },
      {
        key: 'commission-details',
        label: 'Détails d\'une commission',
        description: 'Export détaillé d\'une commission spécifique'
      },
      {
        key: 'rapport-complet',
        label: 'Rapport complet',
        description: 'Rapport avec toutes les statistiques'
      }
    ];
  }
}

// Instance singleton
export const exportPdfService = new ExportPdfService();

