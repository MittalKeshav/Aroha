'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auth, db, googleProvider } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  signInAnonymously, 
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDocs, collection, deleteDoc, getDoc } from 'firebase/firestore';

export type Task = {
  id: number;
  title: string;
  course?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  completed: boolean;
  tag?: string;
  dateAdded: string;
  notified1Day?: boolean;
  notified1Hour?: boolean;
};

export type FocusSession = {
  id: number;
  duration: number;
  mode: 'timer' | 'stopwatch';
  dateAdded: string;
  timestamp: number;
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
  uid: string;
  username: string;
  displayName: string;
  isGuest?: boolean;
};

export type AppSettings = {
  defaultFocusTime: number;
  defaultBreakTime: number;
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
  loginIndependent: (email: string, pass: string, name?: string, isSignUp?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
  authError: string;
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
    breakAccumulatedSeconds: 0,
    notified30Sec: false
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auth Listener
  useEffect(() => {
    // Catch any hidden errors from the Google Redirect
    getRedirectResult(auth).catch((error) => {
      console.error("Google Redirect Error:", error);
      setAuthError(error.message || "Google Sign-In failed due to browser settings.");
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch User Data from Firestore
        const uid = user.uid;
        
        let profileName = user.displayName;
        const pendingName = window.sessionStorage.getItem('pendingDisplayName');
        if (!profileName && pendingName) {
           profileName = pendingName;
        }
        if (!profileName) profileName = 'User';
        
        window.sessionStorage.removeItem('pendingDisplayName');

        let isGuest = user.isAnonymous;
        
        // INSTANTLY unlock the UI. Do not wait for Firestore to respond.
        setUserProfile({ uid, username: user.email || 'Guest', displayName: profileName, isGuest });
        setIsLoaded(true);

        try {
          // Load Settings
          const settingsSnap = await getDoc(doc(db, `users/${uid}`));
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.displayName) {
               profileName = data.displayName;
               // Update the profile silently in the background if it differs
               setUserProfile(prev => prev ? { ...prev, displayName: profileName as string } : null);
            }
            if (data.settings) setAppSettings(data.settings);
          } else {
            // Initialize user doc
            await setDoc(doc(db, `users/${uid}`), {
              displayName: profileName,
              isGuest,
              email: user.email,
              settings: appSettings
            }, { merge: true });
          }
        } catch (err) {
          console.error("Firestore settings error:", err);
        }

        try {
          // Load Tasks
          const tasksSnap = await getDocs(collection(db, `users/${uid}/tasks`));
          const loadedTasks: Task[] = [];
          tasksSnap.forEach(doc => loadedTasks.push(doc.data() as Task));
          setTasks(loadedTasks.sort((a,b) => a.id - b.id));

          // Load Sessions
          const sessSnap = await getDocs(collection(db, `users/${uid}/sessions`));
          const loadedSessions: FocusSession[] = [];
          sessSnap.forEach(doc => loadedSessions.push(doc.data() as FocusSession));
          
          // Recover backup timer
          const backupStr = localStorage.getItem('zenstudy_backup_session');
          if (backupStr) {
            try {
              const backup = JSON.parse(backupStr);
              if (backup.duration > 0) {
                const now = new Date(backup.timestamp);
                const z = (n: number) => ('0' + n).slice(-2);
                const dateAdded = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
                
                const recoveredSession: FocusSession = {
                  id: backup.timestamp,
                  duration: backup.duration,
                  mode: backup.mode,
                  dateAdded,
                  timestamp: backup.timestamp
                };
                loadedSessions.push(recoveredSession);
                await setDoc(doc(db, `users/${uid}/sessions/${recoveredSession.id}`), recoveredSession);
              }
            } catch (e) { console.error(e); }
            localStorage.removeItem('zenstudy_backup_session');
          }
          
          setFocusSessions(loadedSessions.sort((a,b) => a.timestamp - b.timestamp));
        } catch (err) {
          console.error("Firestore data fetch error:", err);
        }
        // Update active timer target if needed
        setAppSettings(prev => {
           if (prev.defaultFocusTime !== 25 * 60) {
             setActiveTimer(curr => ({ ...curr, targetSeconds: prev.defaultFocusTime }));
           }
           return prev;
        });

      } else {
        setUserProfile(null);
        setTasks([]);
        setFocusSessions([]);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth Functions
  const loginIndependent = async (email: string, pass: string, name?: string, isSignUp?: boolean) => {
    await setPersistence(auth, browserLocalPersistence);
    if (isSignUp) {
      if (name) window.sessionStorage.setItem('pendingDisplayName', name);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, `users/${res.user.uid}`), { displayName: name, isGuest: false }, { merge: true });
        setUserProfile(prev => prev ? { ...prev, displayName: name } : null);
      }
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  };

  const loginWithGoogle = async () => {
    // We MUST use popup. Redirect chains through firebaseapp.com get flagged by strict Antiviruses.
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = async (name: string) => {
    window.sessionStorage.setItem('pendingDisplayName', name);
    await setPersistence(auth, browserSessionPersistence);
    const res = await signInAnonymously(auth);
    await updateProfile(res.user, { displayName: name });
    await setDoc(doc(db, `users/${res.user.uid}`), { displayName: name, isGuest: true }, { merge: true });
    setUserProfile(prev => prev ? { ...prev, displayName: name } : null);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.notificationsEnabled && 'Notification' in window) {
        if (Notification.permission !== 'granted') Notification.requestPermission();
      }
      // Save to Firestore
      if (auth.currentUser) {
        setDoc(doc(db, `users/${auth.currentUser.uid}`), { settings: updated }, { merge: true });
      }
      return updated;
    });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to permanently delete all your data?")) {
      setTasks([]);
      setFocusSessions([]);
      localStorage.clear();
      sessionStorage.clear();
      // Optionally delete from Firestore, but omitting here for safety
    }
  };

  // Task Mutators
  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...taskData, id: Date.now(), completed: false };
    setTasks(prev => [...prev, newTask]);
    if (auth.currentUser) {
      setDoc(doc(db, `users/${auth.currentUser.uid}/tasks/${newTask.id}`), newTask);
    }
  };

  const editTask = (id: number, taskData: Partial<Omit<Task, 'id' | 'completed'>>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...taskData };
        if (auth.currentUser) setDoc(doc(db, `users/${auth.currentUser.uid}/tasks/${id}`), updated);
        return updated;
      }
      return t;
    }));
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        if (auth.currentUser) setDoc(doc(db, `users/${auth.currentUser.uid}/tasks/${id}`), updated);
        return updated;
      }
      return t;
    }));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (auth.currentUser) {
      deleteDoc(doc(db, `users/${auth.currentUser.uid}/tasks/${id}`));
    }
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
    if (auth.currentUser) {
      setDoc(doc(db, `users/${auth.currentUser.uid}/sessions/${newSession.id}`), newSession);
    }
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
          if (state.targetSeconds - totalElapsed <= 30 && state.targetSeconds - totalElapsed > 0 && !state.notified30Sec) {
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Aroha', { body: 'Only 30 seconds left in your focus session! Finish up your thought.', icon: '/rocket.svg' });
            }
            setActiveTimer(prev => ({ ...prev, notified30Sec: true }));
          }

          if (totalElapsed >= state.targetSeconds) {
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Aroha', { body: 'Your focus session is complete! Great job. Time for a break.', icon: '/rocket.svg' });
            }
            stopTimer();
            return;
          }
        }
      } else if (state.isOnBreak) {
        const breakElapsed = Math.floor((Date.now() - (state.breakStartTime || Date.now())) / 1000);
        const totalBreakElapsed = state.breakAccumulatedSeconds + breakElapsed;
        const breakTarget = settings.defaultBreakTime;

        if (breakTarget - totalBreakElapsed <= 30 && breakTarget - totalBreakElapsed > 0 && !state.notified30Sec) {
          if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Aroha', { body: 'Only 30 seconds left in your break! Get ready to focus.', icon: '/rocket.svg' });
          }
          setActiveTimer(prev => ({ ...prev, notified30Sec: true }));
        }

        if (totalBreakElapsed >= breakTarget) {
           if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
             new Notification('Aroha', { body: 'Your break is over! Time to get back to work.', icon: '/rocket.svg' });
           }
           setActiveTimer(prev => ({
             ...prev, isOnBreak: false, breakStartTime: null, startTime: Date.now(), notified30Sec: false
           }));
           return;
        }
      }

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prevTasks => {
        let hasChanges = false;
        const newTasks = prevTasks.map(task => {
          if (task.completed || !task.deadline) return task;
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          const msRemaining = deadlineDate.getTime() - now.getTime();
          const hoursRemaining = msRemaining / (1000 * 60 * 60);
          
          let updatedTask = { ...task };
          let notifyMsg = '';

          if (hoursRemaining <= 24 && hoursRemaining > 23 && !task.notified1Day) {
            notifyMsg = `Only 1 day left for your task: "${task.title}"!`;
            updatedTask.notified1Day = true;
            hasChanges = true;
          } else if (hoursRemaining <= 1 && hoursRemaining > 0 && !task.notified1Hour) {
            notifyMsg = `Only 1 hour left for your task: "${task.title}"! Complete it now.`;
            updatedTask.notified1Hour = true;
            hasChanges = true;
          }

          if (notifyMsg && appSettings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Aroha Deadline', { body: notifyMsg, icon: '/rocket.svg' });
          }

          if (hasChanges && auth.currentUser) {
            setDoc(doc(db, `users/${auth.currentUser.uid}/tasks/${updatedTask.id}`), updatedTask);
          }

          return updatedTask;
        });
        return hasChanges ? newTasks : prevTasks;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [appSettings.notificationsEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const playTimer = () => {
    setActiveTimer(prev => ({ ...prev, isPlaying: true, startTime: Date.now(), isOnBreak: false }));
  };

  const pauseTimer = () => {
    setActiveTimer(prev => {
      if (!prev.isPlaying || prev.isOnBreak) return prev;
      const elapsed = Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000);
      return { ...prev, isPlaying: false, accumulatedSeconds: prev.accumulatedSeconds + elapsed, startTime: null };
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
        ...prev, isPlaying: false, startTime: null, accumulatedSeconds: 0,
        isOnBreak: false, breakStartTime: null, breakAccumulatedSeconds: 0,
      };
    });
  };

  const resetTimer = () => stopTimer();

  const updateTimerSettings = (mode: 'timer'|'stopwatch', targetSeconds: number) => {
    setActiveTimer(prev => ({
      ...prev, mode, targetSeconds, accumulatedSeconds: 0, startTime: null, isPlaying: false,
      isOnBreak: false, breakStartTime: null, breakAccumulatedSeconds: 0
    }));
  };

  const toggleBreak = () => {
    setActiveTimer(prev => {
      if (prev.isOnBreak) {
        return { ...prev, isOnBreak: false, breakStartTime: null, startTime: Date.now() };
      } else {
        let elapsed = 0;
        if (prev.isPlaying) elapsed = Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000);
        return { ...prev, isOnBreak: true, breakStartTime: Date.now(), accumulatedSeconds: prev.accumulatedSeconds + elapsed, startTime: null };
      }
    });
  };

  return (
    <TasksContext.Provider value={{ 
      tasks, focusSessions, activeTimer, userProfile, isLoaded, appSettings, authError,
      addTask, editTask, toggleTask, deleteTask, clearTasks, addFocusSession,
      playTimer, pauseTimer, stopTimer, resetTimer, updateTimerSettings, toggleBreak,
      updateSettings, clearAllData, loginIndependent, loginWithGoogle, loginAsGuest, logoutUser
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
