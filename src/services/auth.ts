import { AuthSession, LoginCredentials, VALID_CODES, ValidCode } from '../types/auth';
import { hashCodeForSession } from '../utils/crypto';
import { storageService } from './storage';

/**
 * Service d'authentification pour l'application AJCDC
 */

class AuthService {
  /**
   * Vérifie si un code est valide
   */
  private isValidCode(code: string): code is ValidCode {
    return code in VALID_CODES;
  }

  /**
   * Obtient le rôle associé à un code
   */
  private getRoleForCode(code: ValidCode): string {
    return VALID_CODES[code];
  }

  /**
   * Connexion avec un code
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; session?: AuthSession }> {
    const { code } = credentials;

    // Vérification du code
    if (!this.isValidCode(code)) {
      return {
        success: false,
        message: 'Code secrétaire invalide'
      };
    }

    try {
      // Hachage du code pour la session
      const hashedCode = await hashCodeForSession(code);
      const role = this.getRoleForCode(code);

      // Création de la session
      const session: AuthSession = {
        hashedCode,
        loggedInAt: new Date().toISOString(),
        role
      };

      // Sauvegarde de la session
      const saved = storageService.saveSession(session);
      
      if (!saved) {
        return {
          success: false,
          message: 'Erreur lors de la sauvegarde de la session'
        };
      }

      return {
        success: true,
        message: `Connexion réussie en tant que ${role}`,
        session
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur technique lors de la connexion'
      };
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    storageService.clearSession();
  }

  /**
   * Vérification de l'état de connexion
   */
  isAuthenticated(): boolean {
    const session = storageService.getSession();
    if (!session) return false;

    // Vérification de l'expiration (optionnel - 24h)
    const loginTime = new Date(session.loggedInAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Obtient la session courante
   */
  getCurrentSession(): AuthSession | null {
    if (!this.isAuthenticated()) return null;
    return storageService.getSession();
  }

  /**
   * Obtient le rôle de l'utilisateur connecté
   */
  getCurrentRole(): string | null {
    const session = this.getCurrentSession();
    return session?.role || null;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === role;
  }

  /**
   * Obtient les informations de l'utilisateur connecté
   */
  getCurrentUser(): { role: string; loginTime: string } | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    return {
      role: session.role,
      loginTime: session.loggedInAt
    };
  }

  /**
   * Renouvelle la session (met à jour le timestamp)
   */
  renewSession(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const updatedSession: AuthSession = {
      ...session,
      loggedInAt: new Date().toISOString()
    };

    return storageService.saveSession(updatedSession);
  }
}

// Instance singleton
export const authService = new AuthService();

