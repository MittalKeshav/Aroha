'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TasksContext';

export default function Calendar() {
  const { tasks, addTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setSelectedDate(now);
    setCurrentDate(now);
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  // Month and Year format
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const today = new Date();

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Previous month trailing days
  const prevMonthDaysCount = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => prevMonthDaysCount - firstDay + i + 1);

  // Next month leading days
  const totalSlots = 42; // 6 rows of 7
  const nextMonthDaysCount = totalSlots - (firstDay + daysInMonth);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  // Formatting strings
  const selectedDayName = selectedDate.toLocaleString('default', { weekday: 'long' });
  const selectedMonthShort = selectedDate.toLocaleString('default', { month: 'short' });
  const selectedDateNum = selectedDate.getDate();

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Helper to format Date to ISO String (YYYY-MM-DD)
  const toISOStringLocal = (d: Date) => {
    const z = (n: number) => ('0' + n).slice(-2);
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };

  const selectedDateISO = toISOStringLocal(selectedDate);
  const selectedDataTasks = tasks.filter(t => t.dateAdded === selectedDateISO);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      time: newTaskTime || '1h',
      startTime: newTaskStartTime || undefined,
      endTime: newTaskEndTime || undefined,
      deadline: newTaskDeadline || undefined,
      dateAdded: selectedDateISO
    });

    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskStartTime('');
    setNewTaskEndTime('');
    setNewTaskDeadline('');
    setShowAddModal(false);
  };
  
  const completedCount = selectedDataTasks.filter(t => t.completed).length;
  const progress = selectedDataTasks.length === 0 ? 0 : Math.round((completedCount / selectedDataTasks.length) * 100);

  return (
    <div className="flex-1 px-margin-mobile md:px-margin-desktop py-lg pb-32 md:pb-lg flex flex-col xl:flex-row gap-lg transition-all duration-300 w-full">
      {/* Calendar Section */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            {monthName} {year}
          </h2>
          <div className="flex items-center gap-sm">
            <button 
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={handleToday}
              className="px-sm py-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors border border-outline-variant"
            >
              Today
            </button>
            <button 
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Calendar */}
        <div className="bg-surface/20 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden mb-lg">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-sm text-center font-label-md text-label-md text-on-surface-variant">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[minmax(80px,auto)]">
            {/* Prev month days */}
            {prevMonthDays.map(day => (
              <div key={`prev-${day}`} className="p-xs md:p-sm border-r border-b border-white/5 bg-black/20 text-outline min-h-[80px] flex flex-col">
                <span className="font-body-md text-body-md mb-auto">{day}</span>
              </div>
            ))}
            
            {/* Current month days */}
            {days.map((day) => {
              const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateISO = toISOStringLocal(dateToCheck);
              
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
              const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
              
              // Are there tasks on this day?
              const tasksOnDay = tasks.filter(t => t.dateAdded === dateISO);
              const hasTasks = tasksOnDay.length > 0;
              const allCompleted = hasTasks && tasksOnDay.every(t => t.completed);

              return (
                <div 
                  key={`day-${day}`} 
                  onClick={() => handleDateClick(day)}
                  className={`p-xs md:p-sm border-r border-b min-h-[80px] flex flex-col cursor-pointer group relative transition-all duration-300 ${
                    isSelected ? 'bg-primary/20 shadow-[inset_0_0_20px_rgba(255,165,0,0.2)] border-primary/50 text-on-surface z-10' 
                    : 'border-white/5 bg-transparent text-on-surface hover:bg-white/5'
                  }`}
                >
                  <span className={`font-body-md text-body-md mb-auto ${isSelected ? 'text-primary font-bold' : 'group-hover:text-primary transition-colors'}`}>
                    {day}
                  </span>

                  {hasTasks && !isSelected && (
                    <div className={`w-1.5 h-1.5 rounded-full absolute top-sm right-sm ${allCompleted ? 'bg-secondary' : 'bg-primary'}`}></div>
                  )}

                  {isToday && isSelected && (
                    <div className="mt-xs flex flex-col gap-[2px]">
                      <div className="h-1.5 rounded-full bg-secondary w-full"></div>
                      <div className="h-1.5 rounded-full bg-secondary-container w-3/4"></div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Next month days */}
            {nextMonthDays.map(day => (
              <div key={`next-${day}`} className="p-xs md:p-sm border-r border-b border-white/5 bg-black/20 text-outline min-h-[80px] flex flex-col">
                <span className="font-body-md text-body-md mb-auto">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 group">
          <img 
            src="/calendar_footer.png" 
            alt="Insights background" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent"></div>
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <h3 className="text-headline-md font-headline-md text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">insights</span>
              Weekly Insights
            </h3>
            <p className="text-body-lg text-on-surface max-w-md italic opacity-90">
              "The future depends on what you do today."
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-surface/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-label-md font-label-md shadow-lg">
                <span className="text-secondary mr-2">✦</span> {tasks.filter(t => !t.completed).length} Tasks Upcoming
              </div>
              <div className="bg-surface/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-label-md font-label-md flex items-center gap-2 shadow-lg">
                <span className="text-primary material-symbols-outlined text-[18px]">local_fire_department</span> 3 Day Streak
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Detail Panel (Side Panel) */}
      <aside className="w-full xl:w-96 flex-shrink-0 bg-surface/40 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 p-md flex flex-col h-[calc(100vh-128px)] xl:sticky top-margin-desktop">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">{selectedMonthShort} {selectedDateNum}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant">{selectedDayName}</p>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-outline xl:hidden transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress */}
        {selectedDataTasks.length > 0 && (
          <div className="mb-lg">
            <div className="flex justify-between items-center mb-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Daily Focus</span>
              <span className="font-label-sm text-label-sm text-secondary">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-sm">
          {selectedDataTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 mt-10">
              <span className="material-symbols-outlined text-[48px] mb-4">task</span>
              <p className="font-body-md text-body-md text-on-surface">No current goals for this date.</p>
            </div>
          ) : (
            selectedDataTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-sm rounded-lg flex items-start gap-sm transition-colors ${
                  task.completed 
                    ? 'border border-outline-variant/30 bg-surface-container-low/50 opacity-60' 
                    : 'border border-outline-variant/50 bg-surface-container-lowest shadow-sm cursor-pointer hover:border-primary/50'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center ${
                  task.completed ? 'bg-secondary text-on-secondary' : 'border-2 border-outline-variant'
                }`}>
                  {task.completed && <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 'bold' }}>check</span>}
                </div>
                <div>
                  <p className={`font-body-md text-body-md text-on-surface ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  
                  {!task.completed && new Date(task.dateAdded) < new Date(toISOStringLocal(new Date())) && (
                    <p className="font-label-sm text-label-sm text-error flex items-center gap-[2px] mt-xs">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span> Overdue
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-xs mt-xs">
                    {task.startTime && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.completed ? 'bg-primary-container/20 text-primary' : 'bg-secondary-container/50 text-secondary'
                      }`}>
                        Start: {task.startTime}
                      </span>
                    )}
                    {task.deadline && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.completed ? 'bg-surface-variant text-on-surface-variant' : 'bg-error-container text-error'
                      }`}>
                        Due: {task.deadline}
                      </span>
                    )}
                    {task.tag && !task.startTime && (
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                         task.completed ? 'bg-primary-container/20 text-primary' : 'bg-secondary-container/50 text-secondary'
                       }`}>
                         {task.tag}
                       </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-md w-full py-sm rounded-lg border-2 border-dashed border-outline-variant text-on-surface-variant font-label-md text-label-md hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined">add</span> Add Task to {selectedMonthShort} {selectedDateNum}
        </button>
      </aside>

      {/* Add Task Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-surface rounded-3xl p-lg shadow-ambient-l2 w-full max-w-md border border-outline-variant">
            <div className="flex items-center justify-between mb-md pb-md border-b border-outline-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_task</span>
                Add New Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
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
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
