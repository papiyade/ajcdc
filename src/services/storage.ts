import { Membre, Commission, PV, Counters } from '../types/entities';
import { AuthSession } from '../types/auth';

/**
 * Service de stockage LocalStorage pour l'application AJCDC
 */

const STORAGE_KEYS = {
  MEMBRES: 'ajcdc:membres',
  COMMISSIONS: 'ajcdc:commissions',
  PV: 'ajcdc:pv',
  COUNTERS: 'ajcdc:counters',
  SESSION: 'ajcdc:session'
} as const;

class StorageService {
  /**
   * Sauvegarde des données en LocalStorage avec gestion d'erreurs
   */
  private setItem<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
      return false;
    }
  }

  /**
   * Récupération des données depuis LocalStorage
   */
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Suppression d'une clé du LocalStorage
   */
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  // === GESTION DES COMPTEURS ===
  
  getCounters(): Counters {
    return this.getItem(STORAGE_KEYS.COUNTERS, { membre: 0, commission: 0, pv: 0 });
  }

  private updateCounter(type: keyof Counters): number {
    const counters = this.getCounters();
    counters[type] += 1;
    this.setItem(STORAGE_KEYS.COUNTERS, counters);
    return counters[type];
  }

  getNextId(type: keyof Counters): number {
    return this.updateCounter(type);
  }

  // === GESTION DES MEMBRES ===

  getMembres(): Membre[] {
    return this.getItem(STORAGE_KEYS.MEMBRES, []);
  }

  saveMembres(membres: Membre[]): boolean {
    return this.setItem(STORAGE_KEYS.MEMBRES, membres);
  }

  addMembre(membre: Omit<Membre, 'id' | 'createdAt'>): Membre {
    const membres = this.getMembres();
    const newMembre: Membre = {
      ...membre,
      id: this.getNextId('membre'),
      createdAt: new Date().toISOString(),
      actif: membre.actif ?? true
    };
    membres.push(newMembre);
    this.saveMembres(membres);
    return newMembre;
  }

  updateMembre(id: number, updates: Partial<Membre>): boolean {
    const membres = this.getMembres();
    const index = membres.findIndex(m => m.id === id);
    if (index === -1) return false;

    membres[index] = {
      ...membres[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.saveMembres(membres);
  }

  deleteMembre(id: number): boolean {
    const membres = this.getMembres();
    const filteredMembres = membres.filter(m => m.id !== id);
    if (filteredMembres.length === membres.length) return false;

    // Nettoyer les références dans les commissions
    const commissions = this.getCommissions();
    const updatedCommissions = commissions.map(c => ({
      ...c,
      membresIds: c.membresIds.filter(mid => mid !== id),
      presidentMembreId: c.presidentMembreId === id ? undefined : c.presidentMembreId
    }));
    this.saveCommissions(updatedCommissions);

    return this.saveMembres(filteredMembres);
  }

  // === GESTION DES COMMISSIONS ===

  getCommissions(): Commission[] {
    return this.getItem(STORAGE_KEYS.COMMISSIONS, []);
  }

  saveCommissions(commissions: Commission[]): boolean {
    return this.setItem(STORAGE_KEYS.COMMISSIONS, commissions);
  }

  addCommission(commission: Omit<Commission, 'id' | 'createdAt'>): Commission {
    const commissions = this.getCommissions();
    const newCommission: Commission = {
      ...commission,
      id: this.getNextId('commission'),
      createdAt: new Date().toISOString(),
      membresIds: commission.membresIds || []
    };
    commissions.push(newCommission);
    this.saveCommissions(commissions);
    return newCommission;
  }

  updateCommission(id: number, updates: Partial<Commission>): boolean {
    const commissions = this.getCommissions();
    const index = commissions.findIndex(c => c.id === id);
    if (index === -1) return false;

    commissions[index] = {
      ...commissions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.saveCommissions(commissions);
  }

  deleteCommission(id: number): boolean {
    const commissions = this.getCommissions();
    const filteredCommissions = commissions.filter(c => c.id !== id);
    if (filteredCommissions.length === commissions.length) return false;
    return this.saveCommissions(filteredCommissions);
  }

  // === GESTION DES PV ===

  getPV(): PV[] {
    return this.getItem(STORAGE_KEYS.PV, []);
  }

  savePV(pvList: PV[]): boolean {
    return this.setItem(STORAGE_KEYS.PV, pvList);
  }

  addPV(pv: Omit<PV, 'id' | 'createdAt'>): PV {
    const pvList = this.getPV();
    const newPV: PV = {
      ...pv,
      id: this.getNextId('pv'),
      createdAt: new Date().toISOString(),
      fichiers: pv.fichiers || []
    };
    pvList.push(newPV);
    this.savePV(pvList);
    return newPV;
  }

  updatePV(id: number, updates: Partial<PV>): boolean {
    const pvList = this.getPV();
    const index = pvList.findIndex(p => p.id === id);
    if (index === -1) return false;

    pvList[index] = {
      ...pvList[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.savePV(pvList);
  }

  deletePV(id: number): boolean {
    const pvList = this.getPV();
    const filteredPV = pvList.filter(p => p.id !== id);
    if (filteredPV.length === pvList.length) return false;
    return this.savePV(filteredPV);
  }

  // === GESTION DE LA SESSION ===

  getSession(): AuthSession | null {
    return this.getItem(STORAGE_KEYS.SESSION, null);
  }

  saveSession(session: AuthSession): boolean {
    return this.setItem(STORAGE_KEYS.SESSION, session);
  }

  clearSession(): void {
    this.removeItem(STORAGE_KEYS.SESSION);
  }

  // === SAUVEGARDE/RESTAURATION COMPLÈTE ===

  exportData(): string {
    const data = {
      membres: this.getMembres(),
      commissions: this.getCommissions(),
      pv: this.getPV(),
      counters: this.getCounters(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      // Validation basique
      if (!data.membres || !data.commissions || !data.pv) {
        return { success: false, message: 'Format de données invalide' };
      }

      // Sauvegarde des données
      this.saveMembres(data.membres);
      this.saveCommissions(data.commissions);
      this.savePV(data.pv);
      
      if (data.counters) {
        this.setItem(STORAGE_KEYS.COUNTERS, data.counters);
      }

      return { success: true, message: 'Données importées avec succès' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'importation des données' };
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.SESSION) {
        this.removeItem(key);
      }
    });
  }

  // === STATISTIQUES ===

  getStats() {
    const membres = this.getMembres();
    const commissions = this.getCommissions();
    const pv = this.getPV();

    return {
      totalMembres: membres.length,
      membresActifs: membres.filter(m => m.actif).length,
      totalCommissions: commissions.length,
      totalPV: pv.length,
      dernierPV: pv.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null
    };
  }
}

// Instance singleton
export const storageService = new StorageService();

