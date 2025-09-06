import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Vérification du support des fonctionnalités requises
if (!window.crypto || !window.crypto.subtle) {
  console.error('Web Crypto API non supportée. L\'authentification ne fonctionnera pas correctement.');
}

if (!window.localStorage) {
  console.error('LocalStorage non supporté. L\'application ne fonctionnera pas correctement.');
}

// Configuration PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

