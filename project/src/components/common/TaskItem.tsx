import React from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Clock, Calendar, User, Layers, ArrowRight, MoveLeft, Trash2, Archive, CheckCircle } from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';

interface TaskItemProps {
  task: Task;
  onProcess?: () => void;
  showControls?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onProcess,
  showControls = true
}) => {
  const { updateTask, moveTaskToStatus } = useTaskContext();
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { 
      status: 'completed',
      completedDate: new Date()
    });
  };

  const handleReturnToInbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTaskToStatus(task.id, 'inbox');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTaskToStatus(task.id, 'deleted');
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
        return { 
          color: 'bg-purple-100 text-purple-700', 
          icon: <Calendar className="w-4 h-4 mr-1" />,
          text: `予定日: ${formatDate(task.dueDate)}`
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
    <div 
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onProcess}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center mt-2">
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${color}`}>
              {icon}
              {text}
            </span>
            
            {task.timeEstimate && (
              <span className="text-xs text-gray-500 ml-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.timeEstimate}分
              </span>
            )}
          </div>
        </div>
        
        {showControls && (
          <div className="flex space-x-2">
            {task.status !== 'completed' && task.status !== 'inbox' && task.status !== 'deleted' && (
              <button 
                onClick={handleReturnToInbox}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                title="インボックスに戻す"
              >
                <MoveLeft className="w-5 h-5" />
              </button>
            )}

            {task.status !== 'completed' && task.status !== 'deleted' && (
              <button 
                onClick={handleComplete}
                className="p-1 rounded-full hover:bg-green-100 text-green-600"
                title="完了としてマーク"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
            
            {task.status !== 'deleted' && (
              <button 
                onClick={handleDelete}
                className="p-1 rounded-full hover:bg-red-100 text-red-600"
                title="削除"
              >
                <Trash2 className="w-5 h-5" />
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;