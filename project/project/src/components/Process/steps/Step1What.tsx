import React, { useState } from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { useTaskContext } from '../../../contexts/TaskContext';
import { HelpCircle } from 'lucide-react';

interface Step1Props {
  task: Task;
}

const Step1What: React.FC<Step1Props> = ({ task }) => {
  const { completeStep } = useProcessContext();
  const { updateTask } = useTaskContext();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title !== task.title || description !== task.description) {
      updateTask(task.id, { 
        title, 
        description: description || undefined 
      });
    }
    
    completeStep(1, {});
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            このアイテムは具体的に何についてですか？内容を明確にして整理しましょう。
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            説明（任意）
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md h-20 sm:h-24 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            次へ
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1What;