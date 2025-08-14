import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TaskItem from '../common/TaskItem';
import { Calendar, Clock } from 'lucide-react';

const SomedayList: React.FC = () => {
  const { getTasksByStatus } = useTaskContext();
  const { t } = useLanguage();
  
  const somedayTasks = getTasksByStatus('someday');
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-teal-500" />
          {t('someday')}
        </h1>
        <p className="text-gray-600">
          将来のアイデアと可能性
        </p>
      </div>
      
      {somedayTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptySomeday')}</h3>
          <p className="text-gray-500 max-w-md">
            保留中のアイテムはありません。
            将来のアイデアやタスクがここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            いつか/たぶん ({somedayTasks.length})
          </h2>
          <div className="space-y-3">
            {somedayTasks.map(task => (
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

export default SomedayList;