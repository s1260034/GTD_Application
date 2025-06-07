import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import TaskItem from '../common/TaskItem';
import { Trash2, Clock } from 'lucide-react';

const DeletedList: React.FC = () => {
  const { getTasksByStatus } = useTaskContext();
  const deletedTasks = getTasksByStatus('deleted');
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Trash2 className="w-6 h-6 mr-2 text-red-500" />
          ゴミ箱
        </h1>
        <p className="text-gray-600">
          削除したタスクの一覧
        </p>
      </div>
      
      {deletedTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">ゴミ箱は空です</h3>
          <p className="text-gray-500 max-w-md">
            削除したタスクはここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            削除済みタスク ({deletedTasks.length})
          </h2>
          <div className="space-y-3">
            {deletedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                showControls={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedList;