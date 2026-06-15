'use client';

import React from 'react';
import { TasksProvider } from '@/context/TasksContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      {children}
    </TasksProvider>
  );
}
