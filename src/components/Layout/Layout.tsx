import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../UI/Toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (gère elle-même le positionnement fixe) */}
      <Sidebar />
      
      {/* Main content avec marge pour la sidebar */}
      <div className="lg:pl-64">
        {/* Header fixé */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <Header />
        </div>
        
        {/* Page content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
