'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TasksContext';

export default function Settings() {
  const { userProfile, logoutUser, appSettings, updateSettings, clearAllData } = useTasks();
  const [showGuide, setShowGuide] = useState(false);

  const handleFocusTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultFocusTime: parseInt(e.target.value) });
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultBreakTime: parseInt(e.target.value) });
  };

  const toggleNotifications = () => {
    updateSettings({ notificationsEnabled: !appSettings.notificationsEnabled });
  };

  return (
    <div className="flex-1 min-h-screen px-margin-mobile md:px-margin-desktop py-lg w-full">
      {/* Header Section */}
      <header className="mb-lg flex items-center gap-sm">
        <button aria-label="Go back" className="md:hidden p-2 rounded-full hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-primary">Settings & Help</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-[1200px] mx-auto">
        
        {/* Left Column: Profile & Navigation */}
        <div className="lg:col-span-4 flex flex-col gap-md">
          {/* Profile Card */}
          <section className="bg-surface-container-low rounded-xl p-md border border-outline-variant shadow-sm relative overflow-hidden group hover:border-primary transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-sm mb-md relative z-10">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-headline-md font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-body-lg font-body-lg font-semibold text-on-surface">
                  {userProfile?.displayName || 'User'}
                </h2>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  @{userProfile?.username || 'alex_student'}
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-xs relative z-10">
              {userProfile && (
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      logoutUser();
                    }
                  }}
                  className="flex items-center justify-between w-full p-sm rounded-lg hover:bg-surface-container-high text-left transition-colors"
                >
                  <span className="flex items-center gap-sm text-body-md font-body-md text-on-surface">
                    <span className="material-symbols-outlined text-primary">logout</span> Logout Profile
                  </span>
                </button>
              )}
              <div className="h-px bg-outline-variant my-xs"></div>
              <button 
                onClick={clearAllData}
                className="flex items-center justify-between w-full p-sm rounded-lg hover:bg-error-container text-left transition-colors text-error"
              >
                <span className="flex items-center gap-sm text-body-md font-body-md">
                  <span className="material-symbols-outlined">delete_forever</span> Clear All Local Data
                </span>
              </button>
            </nav>
          </section>
        </div>

        {/* Right Column: Settings Panels */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          
          {/* Preferences Panel */}
          <section className="flex flex-col gap-md">
            <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-xs">Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              
              {/* Timer Setting */}
              <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-secondary">timer</span>
                  <h4 className="text-body-md font-body-md font-semibold text-on-surface">Timer Settings</h4>
                </div>
                <p className="text-label-md font-label-md text-on-surface-variant mb-md">Set your default focus and break durations.</p>
                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-body-md text-on-surface">Focus Time</label>
                    <select 
                      value={appSettings.defaultFocusTime} 
                      onChange={handleFocusTimeChange}
                      className="bg-surface-container border border-outline-variant rounded p-1 text-on-surface"
                    >
                      <option value={15 * 60}>15 min</option>
                      <option value={25 * 60}>25 min</option>
                      <option value={30 * 60}>30 min</option>
                      <option value={45 * 60}>45 min</option>
                      <option value={50 * 60}>50 min</option>
                      <option value={60 * 60}>60 min</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-body-md text-on-surface">Break Time</label>
                    <select 
                      value={appSettings.defaultBreakTime} 
                      onChange={handleBreakTimeChange}
                      className="bg-surface-container border border-outline-variant rounded p-1 text-on-surface"
                    >
                      <option value={5 * 60}>5 min</option>
                      <option value={10 * 60}>10 min</option>
                      <option value={15 * 60}>15 min</option>
                      <option value={20 * 60}>20 min</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications Setting */}
              <div className="glass-panel rounded-xl p-md border border-white/10">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-secondary">notifications_active</span>
                  <h4 className="text-body-md font-body-md font-semibold text-on-surface">Desktop Notifications</h4>
                </div>
                <p className="text-label-md font-label-md text-on-surface-variant mb-md">Get notified in advance when a focus session or break ends, and receive reminders for upcoming task deadlines.</p>
                <div className="flex flex-col gap-sm mt-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-body-md font-body-md text-on-surface group-hover:text-primary transition-colors">Enable Notifications</span>
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={appSettings.notificationsEnabled} 
                        onChange={toggleNotifications} 
                      />
                      <div className="w-10 h-5 bg-surface-variant rounded-full peer peer-checked:bg-secondary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-secondary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </div>
                  </label>
                  {appSettings.notificationsEnabled && typeof window !== 'undefined' && Notification.permission !== 'granted' && (
                    <p className="text-xs text-error mt-2">Please allow notifications in your browser settings.</p>
                  )}
                </div>
              </div>
              
            </div>
          </section>

          {/* Help & Support Panel */}
          <section className="flex flex-col gap-md">
            <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-xs">Help & Support</h3>
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-md flex items-center justify-between text-left hover:bg-surface-container-high transition-colors border-b border-outline-variant"
              >
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">book</span>
                  <div>
                    <h4 className="text-body-md font-body-md font-semibold text-on-surface">User Guide (How to use)</h4>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Learn the Aroha workflow.</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-outline transition-transform ${showGuide ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {showGuide && (
                <div className="p-md glass-sub-panel text-body-md text-on-surface-variant border-b border-white/10 flex flex-col gap-4">
                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">1. Add & Manage Tasks</h5>
                    <p>Go to the <strong>Today</strong> tab. Here you can add tasks you want to accomplish today. You can optionally specify a start time, end time, and deadline to better organize your schedule. Check off tasks as you finish them!</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">2. Deep Work Sessions</h5>
                    <p>Head over to the <strong>Focus</strong> tab. Select a task you're working on, and hit the Play button to start your Pomodoro timer or Stopwatch. When the timer is active, Aroha will continually save your progress every second, so you'll never lose your focus time even if you accidentally close the website.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">3. Taking Breaks</h5>
                    <p>Once your focus timer finishes, take a well-deserved break! You can easily toggle the <strong>Take a Break</strong> feature which automatically pauses your focus time and starts a break countdown.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">4. Desktop Notifications</h5>
                    <p>Don't want to keep checking the tab? Enable <strong>Desktop Notifications</strong> in the Settings panel above. Your computer will send you a native pop-up alert 30 seconds before your focus or break timer finishes, as well as reminders 1 day and 1 hour before a task deadline!</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-on-surface mb-1">5. Tracking Your Growth</h5>
                    <p>Your finished and unfinished tasks automatically sync! Use the <strong>Calendar</strong> to view tasks from past or future dates, and the <strong>Backlog</strong> to catch up on any tasks from yesterday that you missed.</p>
                  </div>
                </div>
              )}
              
              <div className="p-md glass-sub-panel flex items-center justify-between">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Aroha App Version 2.5 (Local Auth)</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
