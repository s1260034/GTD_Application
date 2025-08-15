import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TaskItem from '../common/TaskItem';
import { ArrowRight, ListChecks } from 'lucide-react';

const NextActionsList: React.FC = () => {
  const { getTasksByStatus } = useTaskContext();
  const { t } = useLanguage();
  
  const nextTasks = getTasksByStatus('next');
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <ArrowRight className="w-6 h-6 mr-2 text-blue-500" />
          {t('nextActions')}
        </h1>
        <p className="text-gray-600">
          今すぐ実行できるタスク
        </p>
      </div>
      
      {nextTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <ListChecks className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptyNextActions')}</h3>
          <p className="text-gray-500 max-w-md">
            インボックスのアイテムを処理して、次のアクションリストを作成してください。
            これらは今すぐ取り組めるタスクです。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            次のアクション ({nextTasks.length})
          </h2>
          <div className="space-y-3">
            {nextTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NextActionsList;