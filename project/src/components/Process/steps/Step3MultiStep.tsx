import React from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { Layers, ArrowRight, HelpCircle } from 'lucide-react';

interface Step3Props {
  task: Task;
}

const Step3MultiStep: React.FC<Step3Props> = ({ task }) => {
  const { completeStep } = useProcessContext();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            このタスクを完了するために複数のステップが必要ですか？
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <button
          onClick={() => completeStep(3, 'yes')}
          className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-green-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <Layers className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">はい、プロジェクトです</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              完了するために複数のステップや行動が必要です
            </p>
          </div>
        </button>
        
        <button
          onClick={() => completeStep(3, 'no')}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-blue-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">いいえ、単一のタスクです</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              一度の作業で完了できる単一のタスクです
            </p>
          </div>
        </button>
      </div>
      
      <div className="p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
        <p className="text-xs sm:text-sm text-yellow-700">
          <strong>ヒント:</strong> このタスクを小さなステップに分ける必要がある場合、
          または1回の作業セッションで完了できない場合は、プロジェクトとして扱いましょう。
        </p>
      </div>
    </div>
  );
};

export default Step3MultiStep;