import { Membre, Commission, PV } from '../types/entities';

/**
 * Service de validation des données
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

class ValidationService {
  /**
   * Validation d'un membre
   */
  validateMembre(membre: Partial<Membre>): ValidationResult {
    const errors: Record<string, string> = {};

    // Prénom obligatoire
    if (!membre.prenom?.trim()) {
      errors.prenom = 'Le prénom est obligatoire';
    } else if (membre.prenom.trim().length < 2) {
      errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Nom obligatoire
    if (!membre.nom?.trim()) {
      errors.nom = 'Le nom est obligatoire';
    } else if (membre.nom.trim().length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Téléphone optionnel mais format validé si présent
    if (membre.telephone && membre.telephone.trim()) {
      const phoneRegex = /^[0-9 +()-]{6,}$/;
      if (!phoneRegex.test(membre.telephone.trim())) {
        errors.telephone = 'Format de téléphone invalide (minimum 6 caractères, chiffres, espaces, +, -, () autorisés)';
      }
    }

    // Adresse optionnelle mais longueur limitée
    if (membre.adresse && membre.adresse.length > 200) {
      errors.adresse = 'L\'adresse ne peut pas dépasser 200 caractères';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validation d'une commission
   */
  validateCommission(commission: Partial<Commission>): ValidationResult {
    const errors: Record<string, string> = {};

    // Nom obligatoire
    if (!commission.nom?.trim()) {
      errors.nom = 'Le nom de la commission est obligatoire';
    } else if (commission.nom.trim().length < 3) {
      errors.nom = 'Le nom de la commission doit contenir au moins 3 caractères';
    }

    // Description optionnelle mais longueur limitée
    if (commission.description && commission.description.length > 500) {
      errors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    // Vérification que le président fait partie des membres si spécifié
    if (commission.presidentMembreId && commission.membresIds) {
      if (!commission.membresIds.includes(commission.presidentMembreId)) {
        errors.presidentMembreId = 'Le président doit faire partie des membres de la commission';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validation d'un PV
   */
  validatePV(pv: Partial<PV>): ValidationResult {
    const errors: Record<string, string> = {};

    // Titre obligatoire
    if (!pv.titre?.trim()) {
      errors.titre = 'Le titre du PV est obligatoire';
    } else if (pv.titre.trim().length < 5) {
      errors.titre = 'Le titre du PV doit contenir au moins 5 caractères';
    }

    // Date obligatoire et valide
    if (!pv.date) {
      errors.date = 'La date du PV est obligatoire';
    } else {
      const date = new Date(pv.date);
      if (isNaN(date.getTime())) {
        errors.date = 'Format de date invalide';
      } else if (date > new Date()) {
        errors.date = 'La date ne peut pas être dans le futur';
      }
    }

    // Texte obligatoire
    if (!pv.texte?.trim()) {
      errors.texte = 'Le contenu du PV est obligatoire';
    } else if (pv.texte.trim().length < 10) {
      errors.texte = 'Le contenu du PV doit contenir au moins 10 caractères';
    }

    // Lieu optionnel mais longueur limitée
    if (pv.lieu && pv.lieu.length > 100) {
      errors.lieu = 'Le lieu ne peut pas dépasser 100 caractères';
    }

    // Validation des fichiers si présents
    if (pv.fichiers && pv.fichiers.length > 0) {
      pv.fichiers.forEach((fichier, index) => {
        if (!fichier.name || !fichier.dataUrl || !fichier.mime) {
          errors[`fichier_${index}`] = `Le fichier ${index + 1} est invalide`;
        }
        
        // Limite de taille (5MB par fichier)
        if (fichier.size && fichier.size > 5 * 1024 * 1024) {
          errors[`fichier_${index}_size`] = `Le fichier ${fichier.name} dépasse la limite de 5MB`;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validation d'un email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation d'un numéro de téléphone sénégalais
   */
  validateSenegalPhone(phone: string): boolean {
    // Format sénégalais : +221 XX XXX XX XX ou 77/78/70/76/75 XXX XX XX
    const senegalPhoneRegex = /^(\+221\s?)?[7][0-8]\s?\d{3}\s?\d{2}\s?\d{2}$/;
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    return senegalPhoneRegex.test(cleanPhone);
  }

  /**
   * Nettoyage et formatage d'un numéro de téléphone
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/[\s-()]/g, '');
    
    // Si c'est un numéro sénégalais sans indicatif
    if (/^[7][0-8]\d{7}$/.test(cleaned)) {
      return `+221 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}`;
    }
    
    // Si c'est déjà avec l'indicatif
    if (/^\+221[7][0-8]\d{7}$/.test(cleaned)) {
      const number = cleaned.substring(4);
      return `+221 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5, 7)} ${number.substring(7)}`;
    }
    
    return phone; // Retourner tel quel si format non reconnu
  }

  /**
   * Validation de la cohérence des données
   */
  validateDataConsistency(membres: Membre[], commissions: Commission[]): string[] {
    const warnings: string[] = [];

    // Vérifier que tous les membres référencés dans les commissions existent
    commissions.forEach(commission => {
      commission.membresIds.forEach(membreId => {
        if (!membres.find(m => m.id === membreId)) {
          warnings.push(`Commission "${commission.nom}": membre avec ID ${membreId} introuvable`);
        }
      });

      // Vérifier que le président existe
      if (commission.presidentMembreId) {
        if (!membres.find(m => m.id === commission.presidentMembreId)) {
          warnings.push(`Commission "${commission.nom}": président avec ID ${commission.presidentMembreId} introuvable`);
        }
      }
    });

    return warnings;
  }

  /**
   * Sanitisation d'une chaîne de caractères
   */
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/[<>]/g, ''); // Supprimer les caractères potentiellement dangereux
  }

  /**
   * Validation d'un fichier uploadé
   */
  validateFile(file: File): ValidationResult {
    const errors: Record<string, string> = {};

    // Taille maximale : 5MB
    if (file.size > 5 * 1024 * 1024) {
      errors.size = 'Le fichier ne peut pas dépasser 5MB';
    }

    // Types autorisés
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.type = 'Type de fichier non autorisé';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Instance singleton
export const validationService = new ValidationService();

