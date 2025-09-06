import React from 'react';
import { clsx } from 'clsx';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth, useApp } from '../../contexts/AppContext';
import { Button } from '../UI/Button';

export function Header() {
  const { userRole, logout } = useAuth();
  const { toggleSidebar } = useApp();

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Menu />}
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Ouvrir le menu"
          />
          
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AJ</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                AJCDC – Gestion
              </h1>
              <p className="text-xs text-gray-500">
                Association des Jeunes de la Cité CDC de Bambilor
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          {userRole && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-full">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {userRole}
              </span>
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut />}
            onClick={handleLogout}
            className="text-gray-600 hover:text-redaj"
            aria-label="Se déconnecter"
          >
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

