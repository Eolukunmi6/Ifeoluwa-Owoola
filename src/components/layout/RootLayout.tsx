import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div 
      className={`min-h-screen flex flex-col font-sans text-gray-900 ${!isHomePage ? 'bg-cover bg-center bg-fixed bg-no-repeat bg-gradient-to-br from-indigo-200 via-purple-100 to-teal-100' : 'bg-slate-50'}`}
      style={!isHomePage ? { backgroundImage: 'url(/premium-bg.png)' } : {}}
    >
      <Navbar />
      <main className="flex-grow relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
