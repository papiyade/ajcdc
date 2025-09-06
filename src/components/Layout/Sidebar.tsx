import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../UI/Button';

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Membres',
    href: '/membres',
    icon: Users
  },
  {
    name: 'Commissions',
    href: '/commissions',
    icon: Building2
  },
  {
    name: 'Procès-verbaux',
    href: '/pv',
    icon: FileText
  },
  {
    name: 'Paramètres',
    href: '/parametres',
    icon: Settings
  }
];

export function Sidebar() {
  const { state, toggleSidebar } = useApp();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={toggleSidebar}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AJ</span>
              </div>
              <span className="font-semibold text-gray-900">AJCDC</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<X />}
              onClick={toggleSidebar}
              aria-label="Fermer le menu"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                  onClick={() => {
                    // Fermer la sidebar sur mobile après navigation
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>AJCDC – Gestion v1.0.0</p>
              <p className="mt-1">
                © 2024 Association des Jeunes de la Cité CDC
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

