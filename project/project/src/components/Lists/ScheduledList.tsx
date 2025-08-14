import React, { useState } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TaskItem from '../common/TaskItem';
import { Calendar, Clock, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

type ViewMode = 'list' | 'calendar';

const ScheduledList: React.FC = () => {
  const { getTasksByStatus, addTask } = useTaskContext();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const scheduledTasks = getTasksByStatus('scheduled');
  
  // Group tasks by date - use scheduledDate instead of dueDate
  const tasksByDate: Record<string, typeof scheduledTasks> = {};
  
  scheduledTasks.forEach(task => {
    // Use scheduledDate for scheduled tasks
    const taskDate = task.scheduledDate || task.dueDate;
    if (!taskDate) return;
    
    const dateStr = taskDate.toISOString().split('T')[0];
    if (!tasksByDate[dateStr]) {
      tasksByDate[dateStr] = [];
    }
    tasksByDate[dateStr].push(task);
  });
  
  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort();

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowAddTask(true);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && selectedDate) {
      addTask({
        title: newTaskTitle.trim(),
        status: 'scheduled',
        scheduledDate: selectedDate, // Use scheduledDate instead of dueDate
      });
      setNewTaskTitle('');
      setShowAddTask(false);
      setSelectedDate(null);
    }
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        .toISOString().split('T')[0];
      const dayTasks = tasksByDate[dateStr] || [];
      const isToday = new Date().toDateString() === 
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 2).map(task => (
              <div
                key={task.id}
                className="text-xs p-1 bg-purple-100 text-purple-700 rounded truncate"
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayTasks.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(dayName => (
            <div
              key={dayName}
              className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-6">
      {sortedDates.map(dateStr => (
        <div key={dateStr}>
          <h3 className="text-md font-medium text-gray-700 mb-3 sticky top-0 bg-white py-2 border-b border-gray-200">
            {formatDate(new Date(dateStr), true)}
          </h3>
          <div className="space-y-3">
            {tasksByDate[dateStr].map(task => (
              <TaskItem
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-purple-500" />
            {t('scheduled')}
          </h1>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 mr-1 inline" />
              リスト
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1 inline" />
              カレンダー
            </button>
          </div>
        </div>
        
        <p className="text-gray-600">
          特定の日付が設定されているタスク
        </p>
      </div>
      
      {scheduledTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptyScheduled')}</h3>
          <p className="text-gray-500 max-w-md">
            予定済みのタスクはありません。
            特定の日付に実行する必要があるタスクがここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              予定済み ({scheduledTasks.length})
            </h2>
            {viewMode === 'calendar' && (
              <p className="text-xs text-gray-500">
                日付をクリックしてタスクを追加
              </p>
            )}
          </div>
          
          {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                タスクを追加
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate, true)}
              </p>
            </div>
            
            <form onSubmit={handleAddTask} className="p-4">
              <div className="mb-4">
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  タスクのタイトル
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスクを入力してください"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setSelectedDate(null);
                    setNewTaskTitle('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledList;