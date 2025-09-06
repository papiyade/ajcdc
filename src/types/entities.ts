export type ID = number;

export interface Membre {
  id: ID;
  prenom: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  createdAt: string;
  updatedAt?: string;
  actif: boolean;
}

export interface Commission {
  id: ID;
  nom: string;
  description?: string;
  presidentMembreId?: ID;
  membresIds: ID[];
  createdAt: string;
  updatedAt?: string;
}

export interface PV {
  id: ID;
  titre: string;
  date: string;
  lieu?: string;
  texte: string;
  fichiers?: PVFichier[];
  createdAt: string;
  updatedAt?: string;
}

export interface PVFichier {
  name: string;
  dataUrl: string;
  mime: string;
  size: number;
}

export interface Counters {
  membre: number;
  commission: number;
  pv: number;
}

// Types pour les vues enrichies
export interface MembreAvecCommissions extends Membre {
  commissions: Commission[];
  estPresident: boolean;
}

export interface CommissionAvecMembres extends Commission {
  membres: Membre[];
  president?: Membre;
}

// Types pour les filtres et recherches
export interface MembreFilters {
  search?: string;
  actif?: boolean;
  sansCommission?: boolean;
}

export interface CommissionFilters {
  search?: string;
}

export interface PVFilters {
  search?: string;
  dateDebut?: string;
  dateFin?: string;
}

// Types pour les exports
export interface ExportOptions {
  format: 'excel' | 'pdf';
  filename?: string;
  includeInactifs?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

