import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAuth } from './contexts/AppContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
// Import des autres pages (à créer)
// import { Membres } from './pages/Membres';
// import { Commissions } from './pages/Commissions';
// import { PV } from './pages/PV';
// import { Parametres } from './pages/Parametres';

// Composant pour les routes protégées
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Composant principal de l'application
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Route de connexion */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes protégées */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* 
          <Route path="membres" element={<Membres />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="pv" element={<PV />} />
          <Route path="parametres" element={<Parametres />} />
          */}
          
          {/* Pages temporaires pour les routes non implémentées */}
          <Route path="membres" element={<PlaceholderPage title="Membres" />} />
          <Route path="commissions" element={<PlaceholderPage title="Commissions" />} />
          <Route path="pv" element={<PlaceholderPage title="Procès-verbaux" />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" />} />
        </Route>
        
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

// Page temporaire pour les routes non implémentées
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">Cette page est en cours de développement.</p>
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-primary-800 text-sm">
          🚧 Fonctionnalité en cours d'implémentation
        </p>
      </div>
    </div>
  );
}

// Composant racine avec le provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

