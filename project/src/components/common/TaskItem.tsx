import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Clock, Calendar, User, Layers, ArrowRight, Trash2, Archive, CheckCircle, Edit2, Check, X, ChevronDown, MoreVertical } from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';

interface TaskItemProps {
  task: Task;
  onProcess?: () => void;
  showControls?: boolean;
}

interface TaskStatusDropdownProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ task, onStatusChange, isOpen, onToggle }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    task.scheduledDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const { updateTask } = useTaskContext();

  const statusOptions: { value: TaskStatus; label: string; color: string; bgColor: string }[] = [
    { value: 'next', label: '次のアクション', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    { value: 'waiting', label: '待ち項目', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    { value: 'scheduled', label: '予定済み', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    { value: 'someday', label: 'いつか/たぶん', color: 'text-teal-700', bgColor: 'bg-teal-100' },
    { value: 'reference', label: '参考資料', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  ];

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'scheduled') {
      setShowDatePicker(true);
    } else {
      onStatusChange(newStatus);
      onToggle();
    }
  };

  const handleDateSubmit = () => {
    updateTask(task.id, { 
      status: 'scheduled',
      scheduledDate: new Date(selectedDate)
    });
    setShowDatePicker(false);
    onToggle();
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
            {statusOptions
              .filter(option => option.value !== task.status) // Don't show current status
              .map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${option.color}`}
              >
                {option.label}に移動
              </button>
            ))}
          </div>
        </>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                予定日を設定
              </h3>
            </div>
            
            <div className="p-4">
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                実行予定日
              </label>
              <input
                id="scheduledDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  onToggle();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={handleDateSubmit}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                設定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onProcess,
  showControls = true
}) => {
  const { updateTask, moveTaskToStatus } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { 
      status: 'completed',
      completedDate: new Date()
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTaskToStatus(task.id, 'deleted');
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleEditSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      await updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave(e as any);
    } else if (e.key === 'Escape') {
      handleEditCancel(e as any);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    moveTaskToStatus(task.id, newStatus);
  };

  const handleTaskClick = () => {
    if (onProcess) {
      onProcess();
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const getStatusInfo = () => {
    switch (task.status) {
      case 'inbox':
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: <Clock className="w-4 h-4 mr-1" />,
          text: 'インボックス'
        };
      case 'next':
        return { 
          color: 'bg-blue-100 text-blue-700', 
          icon: <ArrowRight className="w-4 h-4 mr-1" />,
          text: '次のアクション'
        };
      case 'waiting':
        return { 
          color: 'bg-orange-100 text-orange-700', 
          icon: <User className="w-4 h-4 mr-1" />,
          text: `待ち: ${task.assignedTo || '担当者'}`
        };
      case 'scheduled':
        // Use scheduledDate first, then fallback to dueDate
        const displayDate = task.scheduledDate || task.dueDate;
        return { 
          color: 'bg-purple-100 text-purple-700', 
          icon: <Calendar className="w-4 h-4 mr-1" />,
          text: `予定日: ${displayDate ? formatDate(displayDate) : '日付未設定'}`
        };
      case 'project':
        return { 
          color: 'bg-green-100 text-green-700', 
          icon: <Layers className="w-4 h-4 mr-1" />,
          text: 'プロジェクト'
        };
      case 'someday':
        return { 
          color: 'bg-teal-100 text-teal-700', 
          icon: <Clock className="w-4 h-4 mr-1" />,
          text: 'いつか'
        };
      case 'reference':
        return {
          color: 'bg-indigo-100 text-indigo-700',
          icon: <Archive className="w-4 h-4 mr-1" />,
          text: '参考資料'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          text: '完了済み'
        };
      case 'deleted':
        return {
          color: 'bg-red-100 text-red-700',
          icon: <Trash2 className="w-4 h-4 mr-1" />,
          text: '削除済み'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: <Clock className="w-4 h-4 mr-1" />,
          text: 'タスク'
        };
    }
  };

  const { color, icon, text } = getStatusInfo();

  return (
    <div className="relative">
      <div 
        className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center mb-2\" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 font-medium text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <button
                  onClick={handleEditSave}
                  className="ml-2 p-1 rounded-full hover:bg-green-100 text-green-600"
                  title="保存"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  title="キャンセル"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-2">
                <h3 className="font-medium text-gray-800 text-sm leading-tight">{task.title}</h3>
              </div>
            )}
            
            {/* Status badge */}
            <div className="flex items-center">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center ${color}`}>
                {icon}
                {text}
              </span>
              
              {task.scheduledDate && (
                <span className="text-xs text-purple-600 ml-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(task.scheduledDate)}
                </span>
              )}
              
              {task.timeEstimate && (
                <span className="text-xs text-gray-500 ml-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.timeEstimate}分
                </span>
              )}
            </div>
          </div>
          
          {showControls && !isEditing && (
            <div className="flex space-x-1 ml-2">
              {task.status !== 'deleted' && task.status !== 'completed' && (
                <button
                  onClick={handleEditStart}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  title="タスク名を編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {task.status !== 'completed' && task.status !== 'deleted' && (
                <button 
                  onClick={handleComplete}
                  className="p-1 rounded-full hover:bg-green-100 text-green-600"
                  title="完了としてマーク"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              
              {task.status !== 'deleted' && (
                <button 
                  onClick={handleDelete}
                  className="p-1 rounded-full hover:bg-red-100 text-red-600"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {task.status === 'inbox' && onProcess && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProcess();
                  }}
                  className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                  title="このアイテムを処理"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Description section - only show if exists and not editing */}
        {task.description && !isEditing && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          </div>
        )}
      </div>

      {/* Status Change Dropdown - positioned below the task */}
      {task.status !== 'deleted' && task.status !== 'completed' && (
        <TaskStatusDropdown
          task={task}
          onStatusChange={handleStatusChange}
          isOpen={isDropdownOpen}
          onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      )}
    </div>
  );
};

export default TaskItem;