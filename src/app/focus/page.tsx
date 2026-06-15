'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/context/TasksContext';

export default function Focus() {
  const { 
    focusSessions, activeTimer, 
    playTimer, pauseTimer, resetTimer, updateTimerSettings, toggleBreak
  } = useTasks();
  
  // Timer editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState('00');
  const [editMinutes, setEditMinutes] = useState('25');

  // Introduce local view mode so switching tabs doesn't reset running timers!
  const [viewMode, setViewMode] = useState<'timer' | 'stopwatch'>('timer');

  // Local derived state for UI ticking
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    // Calculate display time based on viewMode
    const calcTime = () => {
      // If we are looking at the currently active mode
      if (viewMode === activeTimer.mode) {
        let elapsed = 0;
        if (activeTimer.isPlaying && !activeTimer.isOnBreak) {
          elapsed = Math.floor((Date.now() - (activeTimer.startTime || Date.now())) / 1000);
        }
        const totalElapsed = activeTimer.accumulatedSeconds + elapsed;
        if (activeTimer.mode === 'timer') {
          return Math.max(0, activeTimer.targetSeconds - totalElapsed);
        } else {
          return totalElapsed;
        }
      } else {
        // If we are looking at a different mode, show its static default time
        if (viewMode === 'timer') {
          return (parseInt(editHours) * 3600) + (parseInt(editMinutes) * 60) || 25 * 60;
        } else {
          return 0; // Stopwatch default
        }
      }
    };

    setDisplayTime(calcTime());

    let interval: NodeJS.Timeout;
    if (activeTimer.isPlaying && !activeTimer.isOnBreak && viewMode === activeTimer.mode) {
      interval = setInterval(() => {
        setDisplayTime(calcTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, viewMode, editHours, editMinutes]);

  const togglePlay = () => {
    if (activeTimer.isPlaying) {
      if (activeTimer.mode === viewMode) {
        pauseTimer();
      } else {
        // Starting a new mode while the other is running
        stopTimer();
        const target = viewMode === 'timer' ? (parseInt(editHours) * 3600 + parseInt(editMinutes) * 60) : 0;
        updateTimerSettings(viewMode, target);
        playTimer();
      }
    } else {
      if (activeTimer.mode !== viewMode) {
        const target = viewMode === 'timer' ? (parseInt(editHours) * 3600 + parseInt(editMinutes) * 60) : 0;
        updateTimerSettings(viewMode, target);
      }
      playTimer();
    }
  };

  const handleModeSwitch = (newMode: 'timer' | 'stopwatch') => {
    setViewMode(newMode);
    // We do NOT call updateTimerSettings here anymore. 
    // This allows the stopwatch to keep running in the background when checking the timer.
  };

  const handleEditSave = () => {
    let h = parseInt(editHours) || 0;
    let m = parseInt(editMinutes) || 0;
    
    if (h > 23) h = 23;
    if (m > 59) m = 59;
    if (h === 0 && m === 0 && activeTimer.mode === 'timer') m = 1;

    const newSeconds = (h * 3600) + (m * 60);
    updateTimerSettings(activeTimer.mode, newSeconds);
    
    setEditHours(h.toString().padStart(2, '0'));
    setEditMinutes(m.toString().padStart(2, '0'));
    
    setIsEditing(false);
  };

  const formatTimeDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const now = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  const todayISO = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
  
  const todaysSessions = focusSessions.filter(s => s.dateAdded === todayISO);
  
  // Include currently running timer in the total seconds today so it updates live
  let activeElapsed = 0;
  if (activeTimer.isPlaying && !activeTimer.isOnBreak) {
    activeElapsed = Math.floor((Date.now() - (activeTimer.startTime || Date.now())) / 1000);
  }
  const currentSessionSeconds = activeTimer.accumulatedSeconds + activeElapsed;
  const totalSecondsToday = todaysSessions.reduce((acc, curr) => acc + curr.duration, 0) + currentSessionSeconds;
  
  const formatTotalTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Focus Tips
  const focusTips = [
    "Break large tasks into 25-minute intervals. Stay hydrated and maintain good posture for extended deep work sessions.",
    "Turn off phone notifications and put your device in another room to eliminate subconscious distractions.",
    "Focus on one single task at a time. Multitasking reduces efficiency and increases mistakes.",
    "Take regular 5-minute breaks to rest your eyes and stretch. It prevents burnout.",
    "Write down your top 3 priorities before starting your day, and tackle the hardest one first.",
    "Use ambient noise to block out distracting background sounds and help your brain enter a flow state."
  ];
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * focusTips.length));
  }, []);

  // Today's Focus Flow (Hourly breakdown)
  const sessionsByHour: Record<number, number> = {};
  todaysSessions.forEach(s => {
    const d = new Date(s.timestamp);
    const h = d.getHours();
    sessionsByHour[h] = (sessionsByHour[h] || 0) + s.duration;
  });
  if (currentSessionSeconds > 0) {
    const curHour = new Date().getHours();
    sessionsByHour[curHour] = (sessionsByHour[curHour] || 0) + currentSessionSeconds;
  }

  const [showAllFlow, setShowAllFlow] = useState(false);
  const flowHours = [];
  const hoursKeys = Object.keys(sessionsByHour).map(Number);
  
  if (hoursKeys.length > 0) {
    const minHour = Math.min(...hoursKeys);
    const maxHour = Math.max(new Date().getHours(), ...hoursKeys);
    for (let h = minHour; h <= maxHour; h++) {
      flowHours.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
        duration: sessionsByHour[h] || 0
      });
    }
  }
  
  const displayedFlowHours = showAllFlow ? flowHours : flowHours.slice(0, 4);

  // Histogram logic for past 5 days
  const last5Days = Array.from({length: 5}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    return d;
  });

  const dailyTotals = last5Days.map(date => {
    const iso = `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
    let totalForDay = focusSessions.filter(s => s.dateAdded === iso).reduce((acc, curr) => acc + curr.duration, 0);
    if (iso === todayISO) totalForDay += currentSessionSeconds; // Add active timer to today's bar
    return {
      iso,
      total: totalForDay,
      label: `${z(date.getDate())}/${z(date.getMonth()+1)}`
    };
  });
  
  // Histogram scale: max is at least 12 hours (43200 seconds) so small sessions don't max it out
  const twelveHoursInSecs = 12 * 3600;
  const maxDaily = Math.max(twelveHoursInSecs, ...dailyTotals.map(d => d.total));

  let strokeDashoffset = 0;
  if (viewMode === 'timer') {
    const target = (viewMode === activeTimer.mode) ? activeTimer.targetSeconds : ((parseInt(editHours) * 3600) + (parseInt(editMinutes) * 60) || 25 * 60);
    if (target > 0) {
      strokeDashoffset = 301.59 - (displayTime / target) * 301.59;
    }
  }

  // Determine if the current view is the actively playing session
  const isViewActive = activeTimer.isPlaying && viewMode === activeTimer.mode;
  const isViewOnBreak = activeTimer.isOnBreak && viewMode === activeTimer.mode;

  return (
    <div className="flex-grow relative h-[calc(100vh-theme(spacing.md)*2)] overflow-hidden flex flex-col p-6 w-full">
      <div className="z-10 flex flex-col md:flex-row w-full h-full gap-6">
        
        {/* Left Column: Primary Timer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-8 left-8 flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant shadow-lg z-20">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-label-md font-label-md text-on-surface-variant">Total Focus Today</span>
            <div className="w-px h-4 bg-outline-variant mx-1"></div>
            <span className="text-label-md font-label-md text-secondary font-semibold">{formatTotalTime(totalSecondsToday)}</span>
          </div>

          <div className="absolute top-8 right-8 bg-surface-container-low p-1 rounded-xl flex gap-1 border border-outline-variant z-20">
            <button 
              className={`px-6 py-2 rounded-lg text-label-md font-label-md shadow-sm transition-all duration-200 ${viewMode === 'timer' ? 'bg-surface-bright text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => handleModeSwitch('timer')}
            >
              Timer
            </button>
            <button 
              className={`px-6 py-2 rounded-lg text-label-md font-label-md transition-all duration-200 ${viewMode === 'stopwatch' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => handleModeSwitch('stopwatch')}
            >
              Stopwatch
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6 mt-12">
            <svg 
              className="absolute w-[500px] h-[500px]" 
              viewBox="0 0 100 100"
              style={{ opacity: viewMode === 'timer' ? 1 : 0, transition: 'opacity 0.3s' }}
            >
              <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="48" strokeWidth="1.5"></circle>
              <circle 
                className={`stroke-current progress-ring__circle transition-all duration-1000 ease-linear ${isViewOnBreak ? 'text-secondary' : 'text-primary'}`}
                cx="50" cy="50" fill="transparent" r="48" 
                strokeDasharray="301.59" 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" strokeWidth="2.5"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              ></circle>
            </svg>
            <div className={`glass-panel w-[400px] h-[400px] rounded-full flex flex-col items-center justify-center relative z-10 shadow-2xl transition-all duration-500 ${isViewOnBreak ? 'border-secondary/30' : ''}`} style={{ background: 'rgba(42, 42, 42, 0.4)', backdropFilter: 'blur(12px)', border: isViewOnBreak ? '1px solid rgba(161, 203, 239, 0.3)' : '1px solid rgba(140, 145, 152, 0.1)' }}>
              
              <span className={`text-label-lg font-label-lg mb-6 tracking-widest uppercase opacity-80 ${isViewOnBreak ? 'text-secondary' : 'text-primary'}`}>
                {isViewOnBreak ? 'On Break' : (viewMode === 'timer' ? 'Deep Work' : 'Time Elapsed')}
              </span>
              
              {!isEditing ? (
                <div 
                  onClick={() => { if(!isViewActive) setIsEditing(true); }}
                  className={`text-[100px] md:text-[120px] leading-[1] font-display font-bold text-on-surface tracking-tighter transition-colors ${isViewActive ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:text-primary'}`} 
                  style={{ textShadow: '0 0 40px rgba(161, 203, 239, 0.3)' }}
                  title={!isViewActive ? "Click to edit time" : ""}
                >
                  {formatTimeDisplay(displayTime)}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={editHours} 
                    onChange={e => setEditHours(e.target.value)} 
                    className="w-32 text-[80px] text-center bg-surface-container-highest border border-outline-variant rounded-xl font-display font-bold text-on-surface focus:border-primary focus:outline-none"
                    max="23"
                    min="0"
                  />
                  <span className="text-[80px] font-display text-outline-variant">:</span>
                  <input 
                    type="number" 
                    value={editMinutes} 
                    onChange={e => setEditMinutes(e.target.value)} 
                    className="w-32 text-[80px] text-center bg-surface-container-highest border border-outline-variant rounded-xl font-display font-bold text-on-surface focus:border-primary focus:outline-none"
                    max="59"
                    min="0"
                  />
                  <button onClick={handleEditSave} className="w-16 h-16 bg-primary rounded-full text-on-primary flex items-center justify-center ml-4 hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[32px]">check</span>
                  </button>
                </div>
              )}

              {viewMode === activeTimer.mode && (
                <button 
                  onClick={toggleBreak}
                  className={`mt-8 px-6 py-2 rounded-full text-label-md font-label-md transition-colors border flex items-center gap-2 ${activeTimer.isOnBreak ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface-container border-outline text-outline hover:bg-surface-container-high hover:text-on-surface-variant'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{activeTimer.isOnBreak ? 'play_arrow' : 'coffee'}</span>
                  {activeTimer.isOnBreak ? 'Resume Focus' : 'Take a Quick Break'}
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8 z-20 mt-6">
            <button title="Reset Timer" onClick={resetTimer} className="w-20 h-20 rounded-full glass-sub-panel flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors active:scale-95 shadow-md">
              <span className="material-symbols-outlined text-[36px]">replay</span>
            </button>
            <button 
              title={isViewActive ? "Pause" : "Start"}
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(161,203,239,0.4)] transition-all active:scale-95 group ${isViewOnBreak ? 'bg-surface-container-highest text-outline cursor-not-allowed opacity-50' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
              onClick={togglePlay}
              disabled={isViewOnBreak}
            >
              <span className="material-symbols-outlined text-[56px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isViewActive ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button title="Skip Session" className="w-20 h-20 rounded-full glass-sub-panel flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors active:scale-95 shadow-md opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-[36px]">skip_next</span>
            </button>
          </div>

          {/* Dynamic Focus Insight Banner */}
          <div className="mt-12 w-full max-w-2xl relative overflow-hidden rounded-3xl p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 animate-[gradientFlow_5s_ease_infinite] bg-[length:200%_200%] opacity-50 blur-sm"></div>
            <div className="relative h-full w-full bg-[#11131a]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined text-[32px] text-on-primary">psychology</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <h4 className="text-label-sm font-label-sm text-primary uppercase tracking-widest">In The Zone</h4>
                </div>
                <h3 className="text-title-lg font-title-lg text-on-surface mb-2 font-display">Deep Work State</h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  You are building the neural pathways for mastery. Remove all distractions, focus entirely on the present moment, and let your flow state take over.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Stats Panels */}
        <div className="w-full md:w-[400px] flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border border-white/10">
            <h3 className="text-label-md font-label-md text-on-surface-variant mb-6 uppercase tracking-wider">Session Progress</h3>
            
            <div className="flex items-end gap-3 h-32 mb-3 w-full overflow-hidden">
              {dailyTotals.map((d, idx) => {
                const pct = Math.max(2, Math.round((d.total / maxDaily) * 100)); // minimum 2% for visibility
                return (
                  <div key={d.iso} title={`${d.label}: ${formatTotalTime(d.total)}`} className={`flex-1 rounded-t-md relative group transition-colors ${idx === 4 ? 'bg-primary shadow-[0_0_15px_rgba(161,203,239,0.3)]' : 'bg-surface-container-high hover:bg-surface-bright'}`} style={{ height: `${pct}%` }}>
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs text-on-surface opacity-0 group-hover:opacity-100 whitespace-nowrap bg-surface-container-highest px-2 py-1 rounded shadow-md z-30 pointer-events-none">
                      {formatTotalTime(d.total)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-outline mt-auto px-1">
              {dailyTotals.map(d => <span key={d.iso}>{d.label}</span>)}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border border-white/10 max-h-[300px]">
            <h3 className="text-label-md font-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Today's Focus Flow</h3>
            <div className="flex flex-col flex-grow">
              {flowHours.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 mt-4 text-center">
                  <span className="material-symbols-outlined text-[40px] mb-3">hourglass_empty</span>
                  <p className="text-body-md">Your completed focus sessions will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                  {displayedFlowHours.map(item => {
                    const minutes = Math.floor(item.duration / 60);
                    // Use 60m as max width
                    const pct = Math.min(100, Math.max(0, (minutes / 60) * 100));
                    
                    return (
                      <div key={item.hour} className="flex items-center gap-4">
                        <div className="w-14 text-right text-label-md text-outline">{item.label}</div>
                        <div className="flex-1 bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="w-12 text-label-md text-on-surface font-medium">{minutes > 0 ? `${minutes}m` : '--'}</div>
                      </div>
                    );
                  })}
                  {flowHours.length > 4 && (
                    <button 
                      onClick={() => setShowAllFlow(!showAllFlow)}
                      className="mt-2 text-primary text-label-sm flex items-center justify-center gap-1 hover:text-primary-container transition-colors"
                    >
                      {showAllFlow ? 'See Less' : 'See More'}
                      <span className="material-symbols-outlined text-[16px]">{showAllFlow ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Focus Tip */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex items-start gap-4 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <div>
              <h4 className="text-label-md font-label-md text-on-surface mb-1 uppercase tracking-wider">Focus Tip</h4>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                {focusTips[tipIndex]}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
