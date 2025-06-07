import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';

const InboxInput: React.FC = () => {
  const [taskText, setTaskText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const { addTask } = useTaskContext();

  const { t } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      addTask({
        title: taskText.trim(),
        description: description.trim() || undefined,
        status: 'inbox',
      });
      setTaskText('');
      setDescription('');
      setExpanded(false);
    }
  };

  const handleFocus = () => {
    setExpanded(true);
  };

  const handleCancel = () => {
    setExpanded(false);
    setDescription('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-4 mb-6 transition-all duration-300 ease-in-out border border-gray-200"
    >
      <div className="flex items-center">
        <PlusCircle className="text-gray-400 mr-2 h-5 w-5" />
        <input
          type="text"
          placeholder={t('addToInbox')}
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onFocus={handleFocus}
          className="flex-1 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          autoFocus
        />
        {/* Show capture button only when not expanded and has text */}
        {taskText && !expanded && (
          <button
            type="submit"
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('capture')}
          </button>
        )}
      </div>
      
      {expanded && (
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
  );
};

export default InboxInput;