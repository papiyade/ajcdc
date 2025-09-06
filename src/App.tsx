import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAuth } from './contexts/AppContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Membres } from './pages/Membres';
import { Commissions } from './pages/Commissions';
import { PV } from './pages/PV';
import { Parametres } from './pages/Parametres';

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
          <Route path="membres" element={<Membres />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="pv" element={<PV />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
        
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
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
