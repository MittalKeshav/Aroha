'use client';

import React from 'react';
import { useTasks } from '@/context/TasksContext';

export default function Backlog() {
  const { tasks, toggleTask } = useTasks();

  const toISOStringLocal = (d: Date) => {
    const z = (n: number) => ('0' + n).slice(-2);
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };

  const todayISO = toISOStringLocal(new Date());

  // Backlog criteria: dateAdded is strictly less than today, and it's not completed.
  const backlogTasks = tasks.filter(t => t.dateAdded < todayISO && !t.completed);

  // Divide backlog into "Needs Attention" (older than 2 days) and "Earlier This Week" (within 2 days)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoISO = toISOStringLocal(twoDaysAgo);

  const urgentTasks = backlogTasks.filter(t => t.dateAdded < twoDaysAgoISO);
  const earlierTasks = backlogTasks.filter(t => t.dateAdded >= twoDaysAgoISO);

  const hasTasks = backlogTasks.length > 0;

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen">
      <div className="flex-1 w-full pt-12 px-4 md:px-8 pb-32 max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 glass-panel p-8 rounded-[2rem]">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-white mb-2 tracking-tight drop-shadow-lg">Backlog</h1>
            <p className="text-body-lg font-body-lg text-white/70">Let's clear those hurdles! These tasks are waiting for you.</p>
          </div>
          <div className="flex gap-4 items-center">
            {hasTasks && (
              <button className="text-[#ffb4ab] hover:bg-[#ffb4ab]/10 hover:border-[#ffb4ab]/30 px-6 py-3 rounded-xl transition-all text-label-md font-label-md flex items-center gap-2 border border-white/5 backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Content: Empty State vs Tasks */}
        {!hasTasks ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] group">
              <img 
                src="/joyful_backlog.png" 
                alt="Joyful clear backlog" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-[#b0ceae] shadow-[0_0_20px_rgba(176,206,174,0.3)]">
                  <span className="material-symbols-outlined text-[32px]">celebration</span>
                </div>
                <h2 className="text-headline-md font-headline-md text-white mb-2 tracking-wide drop-shadow-md">No Backlogs</h2>
                <p className="text-body-lg text-white/80">You're all caught up! Enjoy this peaceful moment.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Urgent / Overdue Pane */}
            {urgentTasks.length > 0 && (
              <div className="glass-panel rounded-[2rem] p-8 w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error to-transparent opacity-50"></div>
                <h2 className="text-headline-md font-headline-md text-[#ffb4ab] mb-6 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,180,171,0.5)]">
                  <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center border border-[#ffb4ab]/20">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  Needs Attention
                </h2>
                <div className="flex flex-col gap-4">
                  {urgentTasks.map(task => (
                    <label key={task.id} className={`glass-sub-panel rounded-2xl p-5 flex items-center gap-6 cursor-pointer relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.01] hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-white/30`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="relative flex items-center justify-center shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={task.completed} onChange={() => toggleTask(task.id)} />
                        <div className="w-7 h-7 border-2 border-white/30 rounded-lg flex items-center justify-center transition-all bg-black/20 peer-checked:bg-[rgba(176,206,174,0.4)] peer-checked:border-[#b0ceae] peer-checked:shadow-[0_0_10px_rgba(176,206,174,0.5)]">
                          <span className={`material-symbols-outlined text-[18px] text-[#b0ceae] transition-opacity drop-shadow-[0_0_8px_rgba(176,206,174,0.8)] opacity-0`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-headline-lg-mobile font-headline-md text-white mb-1.5 tracking-wide">{task.title}</h3>
                          <div className="flex items-center gap-4 text-label-md font-label-md text-[#ffb4ab]/90">
                            <span className="flex items-center gap-1.5 bg-[#ffb4ab]/10 px-3 py-1 rounded-full border border-[#ffb4ab]/20"><span className="material-symbols-outlined text-[16px]">event</span> {task.dateAdded}</span>
                            {task.startTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">play_arrow</span> {task.startTime}</span>}
                            {task.endTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">stop</span> {task.endTime}</span>}
                            {task.deadline && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">event</span> Due: {task.deadline}</span>}
                            {task.time && !task.startTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {task.time}</span>}
                          </div>
                        </div>
                        {task.tag && !task.startTime && <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-label-md font-label-md backdrop-blur-sm self-start md:self-auto shadow-[0_0_10px_rgba(161,203,239,0.1)]">{task.tag}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Earlier This Week Pane */}
            {earlierTasks.length > 0 && (
              <div className="glass-panel rounded-[2rem] p-8 w-full">
                <h2 className="text-headline-md font-headline-md text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  Earlier This Week
                </h2>
                <div className="flex flex-col gap-4">
                  {earlierTasks.map(task => (
                    <label key={task.id} className="glass-sub-panel rounded-2xl p-5 flex items-center gap-6 cursor-pointer relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.01] hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-white/30">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="relative flex items-center justify-center shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={task.completed} onChange={() => toggleTask(task.id)} />
                        <div className="w-7 h-7 border-2 border-white/30 rounded-lg flex items-center justify-center transition-all bg-black/20 peer-checked:bg-[rgba(176,206,174,0.4)] peer-checked:border-[#b0ceae] peer-checked:shadow-[0_0_10px_rgba(176,206,174,0.5)]">
                          <span className="material-symbols-outlined text-[18px] text-[#b0ceae] transition-opacity drop-shadow-[0_0_8px_rgba(176,206,174,0.8)] opacity-0" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-headline-lg-mobile font-headline-md text-white mb-1.5 tracking-wide">{task.title}</h3>
                          <div className="flex items-center gap-4 text-label-md font-label-md text-white/60">
                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10"><span className="material-symbols-outlined text-[16px]">event</span> {task.dateAdded}</span>
                            {task.startTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">play_arrow</span> {task.startTime}</span>}
                            {task.endTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">stop</span> {task.endTime}</span>}
                            {task.deadline && <span className="flex items-center gap-1.5 text-error"><span className="material-symbols-outlined text-[16px]">event</span> Due: {task.deadline}</span>}
                            {task.time && !task.startTime && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {task.time}</span>}
                          </div>
                        </div>
                        {task.tag && !task.startTime && <span className="bg-[#b0ceae]/20 text-[#b0ceae] border border-[#b0ceae]/30 px-4 py-1.5 rounded-full text-label-md font-label-md backdrop-blur-sm self-start md:self-auto shadow-[0_0_10px_rgba(176,206,174,0.1)]">{task.tag}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats/Motivation Wide Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="glass-panel bg-primary/10 border-primary/20 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] text-primary/10 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-700 blur-[2px]">psychology</span>
                <div className="relative z-10">
                  <h3 className="text-headline-lg font-headline-lg mb-2 drop-shadow-md">{backlogTasks.length} Tasks</h3>
                  <p className="text-body-lg font-body-lg text-white/80 max-w-xs">Waiting for your attention. You've got this.</p>
                </div>
              </div>
              <div className="glass-panel rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
                <div className="w-20 h-20 mb-6 rounded-full glass-sub-panel flex items-center justify-center text-primary shadow-[0_0_30px_rgba(161,203,239,0.2)]">
                  <span className="material-symbols-outlined text-[40px]">self_improvement</span>
                </div>
                <p className="text-body-lg font-body-lg text-white/90 italic tracking-wide max-w-sm">"It does not matter how slowly you go as long as you do not stop."</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
