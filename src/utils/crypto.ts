/**
 * Utilitaires de cryptographie pour l'authentification
 */

/**
 * Hache une chaîne avec SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Génère un salt aléatoire
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hache un code avec un salt pour la session
 */
export async function hashCodeForSession(code: string): Promise<string> {
  const salt = 'ajcdc-session-salt-2024';
  return await hashString(code + salt);
}

/**
 * Vérifie si un code haché correspond au code original
 */
export async function verifyHashedCode(hashedCode: string, originalCode: string): Promise<boolean> {
  const expectedHash = await hashCodeForSession(originalCode);
  return hashedCode === expectedHash;
}

