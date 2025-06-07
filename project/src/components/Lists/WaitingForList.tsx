import React, { useState } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TaskItem from '../common/TaskItem';
import { Clock, User, Edit2 } from 'lucide-react';

const WaitingForList: React.FC = () => {
  const { getTasksByStatus, updateTask } = useTaskContext();
  const { t } = useLanguage();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingAssignee, setEditingAssignee] = useState('');
  
  const waitingTasks = getTasksByStatus('waiting');
  
  const handleEditAssignee = (taskId: string, currentAssignee?: string) => {
    setEditingTaskId(taskId);
    setEditingAssignee(currentAssignee || '');
  };

  const handleSaveAssignee = (taskId: string) => {
    updateTask(taskId, { assignedTo: editingAssignee.trim() || undefined });
    setEditingTaskId(null);
    setEditingAssignee('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingAssignee('');
  };

  const renderTaskWithAssignee = (task: any) => {
    const isEditing = editingTaskId === task.id;
    
    return (
      <div key={task.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
            
            {task.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center mt-2">
              <span className="text-xs px-2 py-1 rounded-full flex items-center bg-orange-100 text-orange-700">
                <User className="w-4 h-4 mr-1" />
                待ち項目
              </span>
              
              {task.timeEstimate && (
                <span className="text-xs text-gray-500 ml-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.timeEstimate}分
                </span>
              )}
            </div>

            {/* Assignee section */}
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-600 mr-2">担当者:</span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingAssignee}
                    onChange={(e) => setEditingAssignee(e.target.value)}
                    placeholder="担当者名を入力"
                    className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveAssignee(task.id)}
                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-md"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm text-gray-800 mr-2">
                    {task.assignedTo || '未設定'}
                  </span>
                  <button
                    onClick={() => handleEditAssignee(task.id, task.assignedTo)}
                    className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                    title="担当者を編集"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {task.status !== 'completed' && task.status !== 'inbox' && task.status !== 'deleted' && (
              <button 
                onClick={() => updateTask(task.id, { status: 'inbox' })}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                title="インボックスに戻す"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
            )}

            {task.status !== 'completed' && task.status !== 'deleted' && (
              <button 
                onClick={() => updateTask(task.id, { status: 'completed', completedDate: new Date() })}
                className="p-1 rounded-full hover:bg-green-100 text-green-600"
                title="完了としてマーク"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
            )}
            
            {task.status !== 'deleted' && (
              <button 
                onClick={() => updateTask(task.id, { status: 'deleted' })}
                className="p-1 rounded-full hover:bg-red-100 text-red-600"
                title="削除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <User className="w-6 h-6 mr-2 text-orange-500" />
          {t('waitingFor')}
        </h1>
        <p className="text-gray-600">
          他の人に委任して返答待ちのタスク
        </p>
      </div>
      
      {waitingTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptyWaiting')}</h3>
          <p className="text-gray-500 max-w-md">
            他の人に委任して待っているタスクはありません。
            タスクを委任すると、ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            待ち項目 ({waitingTasks.length})
          </h2>
          <div className="space-y-3">
            {waitingTasks.map(task => renderTaskWithAssignee(task))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingForList;