import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../UI/Toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header />
        
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

