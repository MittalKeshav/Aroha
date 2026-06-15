'use client';

import React from 'react';
import { TasksProvider } from '@/context/TasksContext';
import AuthModal from './AuthModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <AuthModal />
      {children}
    </TasksProvider>
  );
}
