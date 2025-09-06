import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AppContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

export function Login() {
  const { isAuthenticated, login } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim()) {
      setError('Veuillez saisir votre code secrétaire');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(code.trim());
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur technique lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-greenaj-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AJ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AJCDC – Gestion
          </h1>
          <p className="text-gray-600">
            Association des Jeunes de la Cité CDC de Bambilor
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connectez-vous avec votre code secrétaire
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Code Secrétaire"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Saisissez votre code"
              required
              fullWidth
              error={error}
              icon={<LogIn />}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Se connecter
            </Button>
          </form>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Codes valides : pbiteye32ajcdc ou fka64ajcdc
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Sensible à la casse - Respectez les majuscules et minuscules
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 AJCDC - Tous droits réservés</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

