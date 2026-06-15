'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TasksContext';

export default function Home() {
  const { tasks, addTask, toggleTask, deleteTask, editTask } = useTasks();
  const [greeting, setGreeting] = useState('Good morning');
  
  // Daily Quote State
  const [quote, setQuote] = useState("Focus is not about saying yes to the things you have to do. It's about saying no to the hundreds of other good ideas that there are.");
  
  // Daily Image Date Seed (Using Local Timezone)
  const now = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  const todayISO = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
  const imageUrl = `https://picsum.photos/seed/${todayISO}/1200/400`;

  // Filter tasks for today
  const todayTasks = tasks.filter(t => t.dateAdded === todayISO);

  // Add task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const [showAllTasks, setShowAllTasks] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    const notes = localStorage.getItem(`aroha_notes_${todayISO}`);
    if (notes) setAdditionalNotes(notes);
  }, [todayISO]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalNotes(e.target.value);
    localStorage.setItem(`aroha_notes_${todayISO}`, e.target.value);
  };

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch random quote
    fetch('https://dummyjson.com/quotes/random')
      .then(res => res.json())
      .then(data => {
        if (data && data.quote) {
          setQuote(data.quote);
        }
      })
      .catch(err => console.error('Failed to fetch quote:', err));
  }, [todayISO]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      time: newTaskTime || '1h',
      startTime: newTaskStartTime || undefined,
      endTime: newTaskEndTime || undefined,
      deadline: newTaskDeadline || undefined,
      dateAdded: todayISO
    });

    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskStartTime('');
    setNewTaskEndTime('');
    setNewTaskDeadline('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      editTask(editingTask.id, {
        title: editingTask.title,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime,
        deadline: editingTask.deadline,
        time: editingTask.time,
      });
      setEditingTask(null);
    }
  };

  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex-1 p-margin-mobile md:p-margin-desktop max-w-7xl mx-auto w-full">
      
      {/* Motivational Banner Area */}
      <div className="mb-lg relative w-full h-[140px] md:h-[180px] lg:h-[220px] rounded-3xl overflow-hidden shadow-ambient-l1 group">
        <img 
          src={imageUrl} 
          alt="Motivational Zen Environment" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-lg w-full flex flex-col justify-end h-full z-10">
          <h2 className="text-display font-display text-white tracking-tight mb-2 drop-shadow-md">
            {greeting}, Alex
          </h2>
          <p className="text-body-lg font-body-lg text-white/90 drop-shadow-sm max-w-2xl italic">
            "{quote}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Main Task List (Left Column) */}
        <section className="lg:col-span-8 flex flex-col gap-md">
          <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
            <h3 className="text-headline-lg font-headline-lg text-on-surface">Today's Goals</h3>
            <div className="flex items-center gap-sm">
              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-label-sm">
                {todayTasks.length} Tasks
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            {todayTasks.length === 0 ? (
              <div className="glass-sub-panel border-dashed rounded-2xl p-xl flex flex-col items-center justify-center text-center opacity-70 mt-md">
                <span className="material-symbols-outlined text-[64px] text-outline mb-4">event_available</span>
                <p className="text-headline-sm text-on-surface mb-2">No goals for today</p>
                <p className="text-body-md text-on-surface-variant">Use the panel on the right to add some tasks!</p>
              </div>
            ) : (
              todayTasks.slice(0, 4).map(task => (
                <div key={task.id} className="group relative glass-sub-panel rounded-2xl p-md transition-all hover:border-primary hover:shadow-[0_0_15px_rgba(255,165,0,0.2)]">
                  <div className="flex items-start gap-md">
                    <div className="pt-1 relative">
                      <input 
                        type="checkbox" 
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="task-checkbox appearance-none w-6 h-6 border-2 border-outline rounded-md checked:bg-secondary checked:border-secondary cursor-pointer transition-colors peer"
                      />
                      <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-secondary opacity-0 peer-checked:opacity-100 pointer-events-none text-[20px] transition-opacity">
                        check
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor={`task-${task.id}`} className={`text-body-lg font-body-lg text-on-surface cursor-pointer block mb-1 transition-all ${task.completed ? 'line-through text-outline' : ''}`}>
                        {task.title}
                      </label>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {task.startTime && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                            {task.startTime}
                          </span>
                        )}
                        {task.endTime && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">stop</span>
                            {task.endTime}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-error">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            Due: {task.deadline}
                          </span>
                        )}
                        {/* Fallback for old tasks */}
                        {task.course && !task.startTime && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-primary">
                            <span className="material-symbols-outlined text-[16px]">book</span>
                            {task.course}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="text-outline hover:text-primary p-1"
                        aria-label="Edit task"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-outline hover:text-error p-1"
                        aria-label="Delete task"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {todayTasks.length > 4 && (
              <button 
                onClick={() => setShowAllTasks(true)}
                className="mt-2 text-primary font-label-md flex items-center justify-center gap-1 hover:underline transition-all py-2"
              >
                See More ({todayTasks.length - 4})
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-sm">
            <h3 className="text-body-lg font-body-lg font-semibold text-on-surface">Additional Notes</h3>
            <textarea 
              value={additionalNotes}
              onChange={handleNotesChange}
              placeholder="e.g., Today's goals are very important..."
              className="w-full glass-sub-panel rounded-xl p-md text-body-md text-on-surface focus:outline-none focus:border-primary min-h-[120px] resize-y transition-colors"
            />
          </div>
        </section>

        {/* Stats Sidebar (Right Column) */}
        <section className="lg:col-span-4 space-y-gutter">
          
          {/* Progress Card */}
          <div className="glass-panel rounded-2xl p-md flex flex-col items-center justify-center">
            <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wide w-full text-left mb-6">Daily Momentum</h4>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-high" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`} 
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`} 
                  strokeLinecap="round" 
                  className="text-primary transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-lg font-headline-lg text-on-surface">{progressPercent}%</span>
              </div>
            </div>
            <p className="text-label-md font-label-md text-on-surface-variant text-center">{completedCount} of {totalCount} tasks completed</p>
          </div>

          {/* Add Task Form Card (Replaces Estimated Time Card) */}
          <div className="glass-panel rounded-2xl p-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-[28px]">add_task</span>
              <h4 className="text-headline-md font-headline-md text-on-surface">Plan New Task</h4>
            </div>
            
            <form onSubmit={handleAddTask} className="flex flex-col gap-5">
              <div>
                <label htmlFor="taskTitle" className="block text-body-md text-on-surface-variant mb-2">Task Name</label>
                <input 
                  type="text" 
                  id="taskTitle"
                  placeholder="e.g., Study for Midterm" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskStartTime" className="block text-body-md text-on-surface-variant mb-2">Start Time</label>
                  <input 
                    type="time" 
                    id="taskStartTime"
                    value={newTaskStartTime}
                    onChange={(e) => setNewTaskStartTime(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="taskEndTime" className="block text-body-md text-on-surface-variant mb-2">End Time</label>
                  <input 
                    type="time" 
                    id="taskEndTime"
                    value={newTaskEndTime}
                    onChange={(e) => setNewTaskEndTime(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskDeadline" className="block text-body-md text-on-surface-variant mb-2">Deadline</label>
                  <input 
                    type="date" 
                    id="taskDeadline"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="taskTime" className="block text-body-md text-on-surface-variant mb-2">Est. Time</label>
                  <input 
                    type="text" 
                    id="taskTime"
                    placeholder="e.g., 1h"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-primary hover:bg-primary-container text-on-primary font-headline-sm py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">add</span>
                Add Task
              </button>
            </form>
          </div>

        </section>
      </div>

      {/* Popups */}
      {/* See More Tasks Popup */}
      {showAllTasks && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-surface rounded-3xl p-lg shadow-ambient-l2 w-full max-w-2xl max-h-[80vh] flex flex-col border border-outline-variant">
            <div className="flex items-center justify-between mb-md pb-md border-b border-outline-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface">All Today's Goals</h3>
              <button onClick={() => setShowAllTasks(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-sm">
              {todayTasks.map(task => (
                <div key={task.id} className="group relative bg-surface-container-low border border-outline-variant rounded-2xl p-md transition-all hover:border-primary">
                  <div className="flex items-start gap-md">
                    <div className="pt-1 relative">
                      <input 
                        type="checkbox" 
                        id={`all-task-${task.id}`}
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="appearance-none w-6 h-6 border-2 border-outline rounded-md checked:bg-secondary checked:border-secondary cursor-pointer transition-colors peer"
                      />
                      <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-secondary opacity-0 peer-checked:opacity-100 pointer-events-none text-[20px] transition-opacity">
                        check
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor={`all-task-${task.id}`} className={`text-body-lg font-body-lg text-on-surface cursor-pointer block mb-1 transition-all ${task.completed ? 'line-through text-outline' : ''}`}>
                        {task.title}
                      </label>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {task.startTime && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                            {task.startTime}
                          </span>
                        )}
                        {task.endTime && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">stop</span>
                            {task.endTime}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1 text-label-sm font-label-sm text-error">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            Due: {task.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="text-outline hover:text-primary p-1"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-outline hover:text-error p-1"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Popup */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-surface rounded-3xl p-lg shadow-ambient-l2 w-full max-w-md border border-outline-variant">
            <div className="flex items-center justify-between mb-md pb-md border-b border-outline-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit Task
              </h3>
              <button onClick={() => setEditingTask(null)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="editTaskTitle" className="block text-body-md text-on-surface-variant mb-2">Task Name</label>
                <input 
                  type="text" 
                  id="editTaskTitle"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editTaskStartTime" className="block text-body-md text-on-surface-variant mb-2">Start Time</label>
                  <input 
                    type="time" 
                    id="editTaskStartTime"
                    value={editingTask.startTime || ''}
                    onChange={(e) => setEditingTask({...editingTask, startTime: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="editTaskEndTime" className="block text-body-md text-on-surface-variant mb-2">End Time</label>
                  <input 
                    type="time" 
                    id="editTaskEndTime"
                    value={editingTask.endTime || ''}
                    onChange={(e) => setEditingTask({...editingTask, endTime: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editTaskDeadline" className="block text-body-md text-on-surface-variant mb-2">Deadline</label>
                  <input 
                    type="date" 
                    id="editTaskDeadline"
                    value={editingTask.deadline || ''}
                    onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="editTaskTime" className="block text-body-md text-on-surface-variant mb-2">Est. Time</label>
                  <input 
                    type="text" 
                    id="editTaskTime"
                    placeholder="e.g., 1h"
                    value={editingTask.time || ''}
                    onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-primary hover:bg-primary-container text-on-primary font-headline-sm py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
