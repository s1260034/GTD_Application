import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useProcessContext } from '../../contexts/ProcessContext';
import TaskItem from '../common/TaskItem';
import InboxInput from './InboxInput';
import { Clock, Info } from 'lucide-react';

const InboxList: React.FC = () => {
  const { getTasksByStatus } = useTaskContext();
  const { startProcessing } = useProcessContext();
  
  const inboxTasks = getTasksByStatus('inbox');
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">インボックス</h1>
        <p className="text-gray-600 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          アイデア、タスク、思いついたことをここに記録しましょう
        </p>
      </div>
      
      <InboxInput />
      
      {inboxTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">インボックスは空です</h3>
          <p className="text-gray-500 max-w-md">
            上の入力フィールドを使って、アイデアやタスクを追加してください。
            頭の中にあることを全てここに記録しましょう。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            処理待ちのアイテム ({inboxTasks.length})
          </h2>
          <div className="space-y-3">
            {inboxTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onProcess={() => startProcessing(task)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxList;