import React, { useState } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface InboxInputProps {
  onUpgrade: () => void;
}

const InboxInput: React.FC<InboxInputProps> = ({ onUpgrade }) => {
  const [taskText, setTaskText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addTask } = useTaskContext();
  const { canCreateTask } = useSubscription();

  const { t } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!canCreateTask) {
      setError('今月のタスク作成上限に達しました。');
      return;
    }
    
    if (taskText.trim()) {
      try {
        await addTask({
          title: taskText.trim(),
          description: description.trim() || undefined,
          status: 'inbox',
        });
        setTaskText('');
        setDescription('');
        setExpanded(false);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleFocus = () => {
    if (!canCreateTask) {
      setError('今月のタスク作成上限に達しました。');
      return;
    }
    setExpanded(true);
    setError(null);
  };

  const handleCancel = () => {
    setExpanded(false);
    setDescription('');
    setError(null);
  };

  return (
    <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ease-in-out border border-gray-200">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm">{error}</span>
            {error.includes('上限') && (
              <div className="mt-2">
                <button
                  onClick={onUpgrade}
                  className="text-xs text-red-600 underline hover:text-red-700"
                >
                  Proプランにアップグレード
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex items-center">
          <PlusCircle className="text-gray-400 mr-2 h-5 w-5" />
          <input
            type="text"
            placeholder={canCreateTask ? t('addToInbox') : 'タスク作成上限に達しました'}
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onFocus={handleFocus}
            disabled={!canCreateTask}
            className={`flex-1 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent ${
              !canCreateTask ? 'cursor-not-allowed opacity-50' : ''
            }`}
            autoFocus={canCreateTask}
          />
          {/* Show capture button only when not expanded and has text */}
          {taskText && !expanded && canCreateTask && (
            <button
              type="submit"
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t('capture')}
            </button>
          )}
        </div>
        
        {expanded && canCreateTask && (
          <div className="mt-3 transition-all duration-300 ease-in-out">
            <textarea
              placeholder={t('addDetails')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md resize-none h-24 outline-none focus:border-blue-400 text-gray-700 bg-transparent"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-500 mr-2 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors"
                disabled={!taskText.trim()}
              >
                {t('capture')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InboxInput;