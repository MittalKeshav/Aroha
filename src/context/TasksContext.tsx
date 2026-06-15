'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type Task = {
  id: number;
  title: string;
  course?: string;
  time?: string; // Used as estimated time
  startTime?: string;
  endTime?: string;
  deadline?: string;
  completed: boolean;
  tag?: string;
  dateAdded: string; // ISO string of the date (YYYY-MM-DD)
  notified1Day?: boolean;
  notified1Hour?: boolean;
};

export type FocusSession = {
  id: number;
  duration: number; // in seconds
  mode: 'timer' | 'stopwatch';
  dateAdded: string; // ISO string (YYYY-MM-DD)
  timestamp: number; // Date.now() for accurate sorting/time-of-day
};

export type ActiveTimerData = {
  mode: 'timer' | 'stopwatch';
  isPlaying: boolean;
  startTime: number | null; 
  accumulatedSeconds: number;
  targetSeconds: number; 
  isOnBreak: boolean;
  breakStartTime: number | null;
  breakAccumulatedSeconds: number;
  notified30Sec: boolean;
};

export type UserProfile = {
  username: string;
  displayName: string;
};

export type AppSettings = {
  defaultFocusTime: number; // in seconds
  defaultBreakTime: number; // in seconds
  notificationsEnabled: boolean;
};

type TasksContextType = {
  tasks: Task[];
  focusSessions: FocusSession[];
  activeTimer: ActiveTimerData;
  userProfile: UserProfile | null;
  appSettings: AppSettings;
  isLoaded: boolean;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  editTask: (id: number, taskData: Partial<Omit<Task, 'id' | 'completed'>>) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  clearTasks: () => void;
  addFocusSession: (session: Omit<FocusSession, 'id' | 'dateAdded' | 'timestamp'>) => void;
  playTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  updateTimerSettings: (mode: 'timer'|'stopwatch', targetSeconds: number) => void;
  toggleBreak: () => void;
  loginUser: (profile: UserProfile, rememberMe: boolean) => void;
  logoutUser: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    defaultFocusTime: 25 * 60,
    defaultBreakTime: 5 * 60,
    notificationsEnabled: false
  });
  const [activeTimer, setActiveTimer] = useState<ActiveTimerData>({
    mode: 'timer',
    isPlaying: false,
    startTime: null,
    accumulatedSeconds: 0,
    targetSeconds: 25 * 60,
    isOnBreak: false,
    breakStartTime: null,
    breakAccumulatedSeconds: 0
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    let loadedTasks: Task[] = [];
    let loadedSessions: FocusSession[] = [];
    let loadedProfile: UserProfile | null = null;
    let loadedSettings: AppSettings | null = null;
    
    const savedTasks = localStorage.getItem('zenstudy_tasks');
    const savedSessions = localStorage.getItem('zenstudy_sessions');
    const savedProfile = sessionStorage.getItem('zenstudy_profile') || localStorage.getItem('zenstudy_profile');
    const savedSettingsStr = localStorage.getItem('zenstudy_settings');
    
    if (savedTasks) {
      try { loadedTasks = JSON.parse(savedTasks); } catch (e) { console.error(e); }
    }
    if (savedSessions) {
      try { loadedSessions = JSON.parse(savedSessions); } catch (e) { console.error(e); }
    }
    if (savedProfile) {
      try { loadedProfile = JSON.parse(savedProfile); } catch (e) { console.error(e); }
    }
    if (savedSettingsStr) {
      try { loadedSettings = JSON.parse(savedSettingsStr); } catch (e) { console.error(e); }
    }

    // Recover any abruptly interrupted active session
    const backupStr = localStorage.getItem('zenstudy_backup_session');
    if (backupStr) {
      try {
         const backup = JSON.parse(backupStr);
         if (backup.duration > 0) { // Recover ALL time to prevent any perceived data loss
            const now = new Date(backup.timestamp);
            const z = (n: number) => ('0' + n).slice(-2);
            const dateAdded = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
            
            loadedSessions.push({
               id: backup.timestamp,
               duration: backup.duration,
               mode: backup.mode,
               dateAdded,
               timestamp: backup.timestamp
            });
            
            // CRITICAL FIX: Save immediately before strict mode re-runs and deletes the backup!
            localStorage.setItem('zenstudy_sessions', JSON.stringify(loadedSessions));
         }
      } catch (e) { console.error(e); }
      localStorage.removeItem('zenstudy_backup_session'); // Clean up backup after recovering
    }

    setTasks(loadedTasks);
    setFocusSessions(loadedSessions);
    setUserProfile(loadedProfile);
    if (loadedSettings) setAppSettings(loadedSettings);
    
    // Set active timer target if it's the default 25 min and we loaded a different default
    if (loadedSettings && loadedSettings.defaultFocusTime !== 25 * 60) {
      setActiveTimer(prev => ({ ...prev, targetSeconds: loadedSettings!.defaultFocusTime }));
    }
    
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('zenstudy_tasks', JSON.stringify(tasks));
      localStorage.setItem('zenstudy_sessions', JSON.stringify(focusSessions));
      localStorage.setItem('zenstudy_settings', JSON.stringify(appSettings));
    }
  }, [tasks, focusSessions, appSettings, isLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Request notification permission if enabling
      if (newSettings.notificationsEnabled && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
      
      return updated;
    });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to permanently delete all your tasks, session history, and settings?")) {
      setTasks([]);
      setFocusSessions([]);
      setUserProfile(null);
      setAppSettings({
        defaultFocusTime: 25 * 60,
        defaultBreakTime: 5 * 60,
        notificationsEnabled: false
      });
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const loginUser = (profile: UserProfile, rememberMe: boolean) => {
    setUserProfile(profile);
    if (rememberMe) {
      localStorage.setItem('zenstudy_profile', JSON.stringify(profile));
    } else {
      sessionStorage.setItem('zenstudy_profile', JSON.stringify(profile));
    }
  };

  const logoutUser = () => {
    setUserProfile(null);
    localStorage.removeItem('zenstudy_profile');
    sessionStorage.removeItem('zenstudy_profile');
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const editTask = (id: number, taskData: Partial<Omit<Task, 'id' | 'completed'>>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  const addFocusSession = (sessionData: Omit<FocusSession, 'id' | 'dateAdded' | 'timestamp'>) => {
    const now = new Date();
    const z = (n: number) => ('0' + n).slice(-2);
    const dateAdded = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;

    const newSession: FocusSession = {
      ...sessionData,
      id: Date.now(),
      dateAdded,
      timestamp: Date.now()
    };
    setFocusSessions(prev => [...prev, newSession]);
  };

  // Timer Logic
  const timerRef = useRef(activeTimer);
  const settingsRef = useRef(appSettings);
  
  useEffect(() => { timerRef.current = activeTimer; }, [activeTimer]);
  useEffect(() => { settingsRef.current = appSettings; }, [appSettings]);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = timerRef.current;
      const settings = settingsRef.current;
      let totalElapsed = state.accumulatedSeconds;

      if (state.isPlaying && !state.isOnBreak) {
        const elapsed = Math.floor((Date.now() - (state.startTime || Date.now())) / 1000);
        totalElapsed += elapsed;
        
        if (state.mode === 'timer') {
          // 30 seconds left notification
          if (state.targetSeconds - totalElapsed <= 30 && state.targetSeconds - totalElapsed > 0 && !state.notified30Sec) {
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('ZenStudy', {
                body: 'Only 30 seconds left in your focus session! Finish up your thought.',
                icon: '/favicon.ico'
              });
            }
            setActiveTimer(prev => ({ ...prev, notified30Sec: true }));
          }

          if (totalElapsed >= state.targetSeconds) {
            // Trigger Desktop Notification if enabled!
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('ZenStudy', {
                body: 'Your focus session is complete! Great job. Time for a break.',
                icon: '/favicon.ico'
              });
            }
            
            stopTimer(); // Auto-stop when timer finishes
            return;
          }
        }
      } else if (state.isOnBreak) {
        const breakElapsed = Math.floor((Date.now() - (state.breakStartTime || Date.now())) / 1000);
        const totalBreakElapsed = state.breakAccumulatedSeconds + breakElapsed;
        const breakTarget = settings.defaultBreakTime;

        // 30 seconds left for break notification
        if (breakTarget - totalBreakElapsed <= 30 && breakTarget - totalBreakElapsed > 0 && !state.notified30Sec) {
          if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('ZenStudy', {
              body: 'Only 30 seconds left in your break! Get ready to focus.',
              icon: '/favicon.ico'
            });
          }
          setActiveTimer(prev => ({ ...prev, notified30Sec: true }));
        }

        if (totalBreakElapsed >= breakTarget) {
           if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
             new Notification('ZenStudy', {
               body: 'Your break is over! Time to get back to work.',
               icon: '/favicon.ico'
             });
           }
           // Stop the break
           setActiveTimer(prev => ({
             ...prev,
             isOnBreak: false,
             breakStartTime: null,
             startTime: Date.now(), // resume the timer immediately
             notified30Sec: false
           }));
           return;
        }
      }

      // Continuously backup the running session just in case the window closes abruptly!
      if (totalElapsed > 0) {
        localStorage.setItem('zenstudy_backup_session', JSON.stringify({
          duration: totalElapsed,
          mode: state.mode,
          timestamp: state.isPlaying ? (state.startTime || Date.now()) : Date.now()
        }));
      } else {
        localStorage.removeItem('zenstudy_backup_session');
      }

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Deadline notifications loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setTasks(prevTasks => {
        let hasChanges = false;
        const newTasks = prevTasks.map(task => {
          if (task.completed || !task.deadline) return task;
          
          // Compute midnight of the deadline date
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0); // Midnight
          
          const msRemaining = deadlineDate.getTime() - now.getTime();
          const hoursRemaining = msRemaining / (1000 * 60 * 60);
          
          let updatedTask = { ...task };
          let notifyMsg = '';

          // 1 Day notification (between 23.9 and 24.1 hours to cover interval variations)
          if (hoursRemaining <= 24 && hoursRemaining > 23 && !task.notified1Day) {
            notifyMsg = `Only 1 day left for your task: "${task.title}"!`;
            updatedTask.notified1Day = true;
            hasChanges = true;
          } 
          // 1 Hour notification (between 0.9 and 1.1 hours)
          else if (hoursRemaining <= 1 && hoursRemaining > 0 && !task.notified1Hour) {
            notifyMsg = `Only 1 hour left for your task: "${task.title}"! Complete it now.`;
            updatedTask.notified1Hour = true;
            hasChanges = true;
          }

          if (notifyMsg && appSettings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('ZenStudy Deadline', {
              body: notifyMsg,
              icon: '/favicon.ico'
            });
          }

          return updatedTask;
        });

        return hasChanges ? newTasks : prevTasks;
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [appSettings.notificationsEnabled]);

  const playTimer = () => {
    setActiveTimer(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
      isOnBreak: false,
    }));
  };

  const pauseTimer = () => {
    setActiveTimer(prev => {
      if (!prev.isPlaying || prev.isOnBreak) return prev;
      const elapsed = Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000);
      return {
        ...prev,
        isPlaying: false,
        accumulatedSeconds: prev.accumulatedSeconds + elapsed,
        startTime: null
      };
    });
  };

  const stopTimer = () => {
    setActiveTimer(prev => {
      let elapsed = 0;
      if (prev.isPlaying && !prev.isOnBreak) {
        elapsed = Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000);
      }
      const totalDuration = prev.accumulatedSeconds + elapsed;
      
      if (totalDuration >= 60) {
        addFocusSession({ duration: totalDuration, mode: prev.mode });
      }

      return {
        ...prev,
        isPlaying: false,
        startTime: null,
        accumulatedSeconds: 0,
        isOnBreak: false,
        breakStartTime: null,
        breakAccumulatedSeconds: 0,
      };
    });
  };

  const resetTimer = () => {
    stopTimer();
  };

  const updateTimerSettings = (mode: 'timer'|'stopwatch', targetSeconds: number) => {
    setActiveTimer(prev => ({
      ...prev,
      mode,
      targetSeconds,
      accumulatedSeconds: 0,
      startTime: null,
      isPlaying: false,
      isOnBreak: false,
      breakStartTime: null,
      breakAccumulatedSeconds: 0
    }));
  };

  const toggleBreak = () => {
    setActiveTimer(prev => {
      if (prev.isOnBreak) {
        return {
          ...prev,
          isOnBreak: false,
          breakStartTime: null,
          startTime: Date.now() 
        };
      } else {
        let elapsed = 0;
        if (prev.isPlaying) {
          elapsed = Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000);
        }
        return {
          ...prev,
          isOnBreak: true,
          breakStartTime: Date.now(),
          accumulatedSeconds: prev.accumulatedSeconds + elapsed,
          startTime: null
        };
      }
    });
  };

  return (
    <TasksContext.Provider value={{ 
      tasks, focusSessions, activeTimer, userProfile, isLoaded, appSettings,
      addTask, editTask, toggleTask, deleteTask, clearTasks, addFocusSession,
      playTimer, pauseTimer, stopTimer, resetTimer, updateTimerSettings, toggleBreak,
      updateSettings, clearAllData, loginUser, logoutUser
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
