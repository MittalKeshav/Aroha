'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTasks } from '@/context/TasksContext';

export default function Navigation() {
  const pathname = usePathname();
  const { userProfile } = useTasks();

  return (
    <>
      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 p-md glass-panel border-r border-white/10 w-56 z-40 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-sm mb-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#ff8a65] flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-[24px]">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md text-primary">Aroha</h1>
            <p className="text-label-md font-label-md text-on-surface-variant">Stay Focused</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <Link href="/" className={`flex items-center gap-md ${pathname === '/' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl px-md py-sm transition-all duration-200 active:scale-[0.98]`}>
            <span className={`material-symbols-outlined ${pathname === '/' ? 'filled' : ''}`}>today</span>
            <span className="text-body-lg font-body-lg">Today</span>
          </Link>
          <Link href="/calendar" className={`flex items-center gap-md ${pathname === '/calendar' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl px-md py-sm transition-all duration-200 active:scale-[0.98]`}>
            <span className={`material-symbols-outlined ${pathname === '/calendar' ? 'filled' : ''}`}>calendar_month</span>
            <span className="text-body-lg font-body-lg">Calendar</span>
          </Link>
          <Link href="/backlog" className={`flex items-center gap-md ${pathname === '/backlog' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl px-md py-sm transition-all duration-200 active:scale-[0.98]`}>
            <span className={`material-symbols-outlined ${pathname === '/backlog' ? 'filled' : ''}`}>inventory_2</span>
            <span className="text-body-lg font-body-lg">Backlog</span>
          </Link>
          <Link href="/focus" className={`flex items-center gap-md ${pathname === '/focus' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl px-md py-sm transition-all duration-200 active:scale-[0.98]`}>
            <span className={`material-symbols-outlined ${pathname === '/focus' ? 'filled' : ''}`}>timer</span>
            <span className="text-body-lg font-body-lg">Focus</span>
          </Link>
        </div>
        <div className="mt-auto pt-6 border-t border-outline-variant">
          <Link href="/settings" className={`flex items-center gap-md ${pathname === '/settings' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'} rounded-xl px-md py-sm transition-all duration-200 active:scale-[0.98]`}>
            <span className={`material-symbols-outlined ${pathname === '/settings' ? 'filled' : ''}`}>settings</span>
            <span className="text-body-lg font-body-lg">Settings & Help</span>
          </Link>
          <div className="mt-4 flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer">
            <img alt="User avatar" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wmsq3h6GiCRlf0OCY74VVrjn7GCEGPXfcxB9TgSIHurY-5hBzD8Q6o2sisvuur3xGdUfVVt5rEQiHcYqrzoMaedfIlhy5tbHUYqyAbkqjs6_9TyDMyk_E6JanzKLFjQc0AJXJSSJDUup9iX4okIzeMleIVuyEt7F7u7FO8gsmu3ITTbJ53ixdWHjEA3jN_JiEgXhvYjnWUEzIbx34HQT4ku7FiCU-CyyC2hk3HsJ2T-i_tAJNSkUxqb3lwua8qDLiwWD4CTszAIg" />
            <span className="text-body-lg font-body-lg text-on-surface">{userProfile?.displayName || 'User'}</span>
          </div>
        </div>
      </nav>

      {/* TopAppBar (Mobile) */}
      <header className="md:hidden flex justify-between items-center w-full px-margin-mobile py-md glass-panel border-b border-white/10 fixed top-0 left-0 z-40 transition-all duration-200 ease-in-out">
        <h1 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          Aroha
        </h1>
        <div className="flex items-center gap-md text-on-surface-variant">
          <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">notifications</span></button>
          <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">settings</span></button>
          <img alt="User avatar" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wmsq3h6GiCRlf0OCY74VVrjn7GCEGPXfcxB9TgSIHurY-5hBzD8Q6o2sisvuur3xGdUfVVt5rEQiHcYqrzoMaedfIlhy5tbHUYqyAbkqjs6_9TyDMyk_E6JanzKLFjQc0AJXJSSJDUup9iX4okIzeMleIVuyEt7F7u7FO8gsmu3ITTbJ53ixdWHjEA3jN_JiEgXhvYjnWUEzIbx34HQT4ku7FiCU-CyyC2hk3HsJ2T-i_tAJNSkUxqb3lwua8qDLiwWD4CTszAIg" />
        </div>
      </header>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm pb-safe pt-xs glass-panel shadow-[0_-4px_20px_0_rgba(53,96,127,0.15)] rounded-t-xl transition-all duration-200 ease-in-out">
        <Link href="/" className={`flex flex-col items-center justify-center ${pathname === '/' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline hover:bg-surface-container-high'} rounded-full px-4 py-1 transition-all scale-95 active:scale-90`}>
          <span className={`material-symbols-outlined ${pathname === '/' ? 'filled' : ''}`}>today</span>
          <span className="text-label-sm font-label-sm mt-1">Today</span>
        </Link>
        <Link href="/calendar" className={`flex flex-col items-center justify-center ${pathname === '/calendar' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline hover:bg-surface-container-high'} rounded-full px-4 py-1 transition-all scale-95 active:scale-90`}>
          <span className={`material-symbols-outlined ${pathname === '/calendar' ? 'filled' : ''}`}>calendar_month</span>
          <span className="text-label-sm font-label-sm mt-1">Calendar</span>
        </Link>
        <Link href="/backlog" className={`flex flex-col items-center justify-center ${pathname === '/backlog' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline hover:bg-surface-container-high'} rounded-full px-4 py-1 transition-all scale-95 active:scale-90`}>
          <span className={`material-symbols-outlined ${pathname === '/backlog' ? 'filled' : ''}`}>inventory_2</span>
          <span className="text-label-sm font-label-sm mt-1">Backlog</span>
        </Link>
        <Link href="/focus" className={`flex flex-col items-center justify-center ${pathname === '/focus' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline hover:bg-surface-container-high'} rounded-full px-4 py-1 transition-all scale-95 active:scale-90`}>
          <span className={`material-symbols-outlined ${pathname === '/focus' ? 'filled' : ''}`}>timer</span>
          <span className="text-label-sm font-label-sm mt-1">Focus</span>
        </Link>
      </nav>
    </>
  );
}
