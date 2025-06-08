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
      <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Use TaskItem for consistent UI */}
        <TaskItem task={task} />
        
        {/* Additional assignee section for waiting tasks */}
        <div className="px-4 pb-4">
          <div className="flex items-center border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-600 mr-2">担当者:</span>
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={editingAssignee}
                  onChange={(e) => setEditingAssignee(e.target.value)}
                  placeholder="担当者名を入力"
                  className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 flex-1"
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
              <div className="flex items-center flex-1">
                <span className="text-sm text-gray-800 mr-2 flex-1">
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