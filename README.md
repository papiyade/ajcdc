# AJCDC – Gestion

Application web de gestion pour l'Association des Jeunes de la Cité CDC de Bambilor.

## 🎯 Objectif

Application web full responsive (mobile d'abord) destinée aux Secrétaires de l'association pour gérer :

- **Membres** : Gestion complète des membres avec informations personnelles
- **Commissions** : Organisation des commissions avec affectation des membres et présidents
- **Procès-verbaux** : Création et gestion des PV de réunions avec pièces jointes
- **Exports** : Génération de fichiers Excel et PDF avec encodage UTF-8

## ✨ Fonctionnalités

### Authentification
- Connexion sécurisée par codes fixes
- Hachage SHA-256 des codes de session
- Gestion des rôles (Secrétaire Principal / Adjoint)

### Gestion des Membres
- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Recherche et filtrage avancés
- Statut actif/inactif
- Validation des données (téléphone, email)
- Export Excel/PDF

### Gestion des Commissions
- Création et gestion des commissions
- Affectation des membres aux commissions
- Nomination des présidents
- Gestion des descriptions et informations
- Export détaillé par commission

### Procès-verbaux
- Éditeur de texte riche pour les PV
- Ajout de pièces jointes (images, PDF, documents)
- Templates de PV prédéfinis
- Duplication de PV existants
- Export PDF officiel avec en-tête AJCDC

### Exports
- **Excel** : Listes complètes avec toutes les données
- **PDF** : Documents officiels avec mise en page AJCDC
- **CSV** : Format léger pour import/export
- Encodage UTF-8 garanti pour tous les formats

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/papiyade/ajcdc.git
cd ajcdc

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview
```

### Accès à l'application

1. Ouvrir http://localhost:3000
2. Se connecter avec un des codes :
   - `pbiteye32ajcdc` (Secrétaire Principal)
   - `fka64ajcdc` (Secrétaire Adjoint)

## 📱 PWA (Progressive Web App)

L'application peut être installée sur mobile et desktop :

1. Ouvrir l'application dans le navigateur
2. Cliquer sur "Installer l'application" ou utiliser le menu du navigateur
3. L'application sera disponible comme une app native

## 🎨 Charte graphique AJCDC

### Couleurs principales
- **Jaune moutarde** : `#C9A227` (couleur principale)
- **Vert foncé** : `#1B5E20` (commissions)
- **Rouge foncé** : `#8B1E1E` (alertes)
- **Bleu BIC** : `#003399` (informations)

### Typographie
- Police principale : Inter
- Tailles : 12px à 32px selon le contexte
- Poids : 300 à 700

## 💾 Stockage des données

### LocalStorage
Toutes les données sont stockées localement dans le navigateur :

```
ajcdc:membres      - Liste des membres
ajcdc:commissions  - Liste des commissions  
ajcdc:pv          - Liste des PV
ajcdc:counters    - Compteurs auto-incrémentés
ajcdc:session     - Session utilisateur
```

### Sauvegarde/Restauration
- **Export JSON** : Sauvegarde complète de toutes les données
- **Import JSON** : Restauration depuis un fichier de sauvegarde
- Format compatible entre versions

## 🔧 Configuration

### Codes d'authentification
Pour modifier les codes d'accès, éditer le fichier `src/types/auth.ts` :

```typescript
export const VALID_CODES = {
  'nouveau_code_1': 'Secrétaire Principal',
  'nouveau_code_2': 'Secrétaire Adjoint'
} as const;
```

### Couleurs de l'interface
Modifier le fichier `tailwind.config.js` pour personnaliser les couleurs :

```javascript
colors: {
  primary: {
    DEFAULT: '#VotreCouleur',
    // ... autres nuances
  }
}
```

### Paramètres d'export
Les templates d'export peuvent être modifiés dans :
- `src/services/exportExcel.ts` pour Excel
- `src/services/exportPdf.ts` pour PDF

## 📊 Structure des données

### Membre
```typescript
interface Membre {
  id: number;
  prenom: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  actif: boolean;
  createdAt: string;
  updatedAt?: string;
}
```

### Commission
```typescript
interface Commission {
  id: number;
  nom: string;
  description?: string;
  presidentMembreId?: number;
  membresIds: number[];
  createdAt: string;
  updatedAt?: string;
}
```

### PV
```typescript
interface PV {
  id: number;
  titre: string;
  date: string;
  lieu?: string;
  texte: string;
  fichiers?: PVFichier[];
  createdAt: string;
  updatedAt?: string;
}
```

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Routing** : React Router v6
- **State Management** : Context API + useReducer
- **Icons** : Lucide React
- **Exports** : SheetJS (Excel) + jsPDF (PDF)
- **Build** : Vite
- **PWA** : Vite PWA Plugin

## 📱 Responsive Design

L'application est optimisée pour :
- **Mobile** : 320px - 768px
- **Tablette** : 768px - 1024px  
- **Desktop** : 1024px+

Breakpoints Tailwind utilisés :
- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+
- `xl:` 1280px+

## 🔒 Sécurité

### Authentification
- Codes hachés avec SHA-256 + salt
- Session expirée après 24h d'inactivité
- Pas de stockage des codes en clair

### Validation des données
- Validation côté client et service
- Sanitisation des entrées utilisateur
- Vérification des formats (téléphone, email)

### Exports
- Scan TruffleHog pour détecter les secrets
- Encodage UTF-8 garanti
- Pas d'exposition de données sensibles

## 🧪 Tests

### Tests manuels recommandés
1. **Authentification** : Tester les codes valides/invalides
2. **CRUD** : Créer, modifier, supprimer des entités
3. **Exports** : Vérifier les fichiers Excel/PDF sur mobile
4. **Responsive** : Tester sur différentes tailles d'écran
5. **PWA** : Installation et fonctionnement offline

### Navigateurs supportés
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 Performance

### Optimisations
- Code splitting par route
- Lazy loading des composants
- Images optimisées
- Bundle analysis avec Vite

### Métriques cibles
- First Contentful Paint < 2s
- Largest Contentful Paint < 3s
- Cumulative Layout Shift < 0.1

## 🤝 Contribution

### Structure du projet
```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages de l'application
├── services/      # Logique métier et API
├── hooks/         # Hooks personnalisés
├── types/         # Types TypeScript
├── utils/         # Utilitaires
└── contexts/      # Contextes React
```

### Conventions de code
- TypeScript strict activé
- ESLint + Prettier configurés
- Nommage en français pour l'UI
- Nommage en anglais pour le code

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

## 📄 Licence

© 2024 Association des Jeunes de la Cité CDC de Bambilor
Tous droits réservés.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024

