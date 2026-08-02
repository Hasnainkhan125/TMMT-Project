import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-surface-light">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
