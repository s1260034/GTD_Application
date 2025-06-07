import React, { useState } from 'react';
import { useProcessContext } from '../../contexts/ProcessContext';
import Step1What from './steps/Step1What';
import Step2ActionRequired from './steps/Step2ActionRequired';
import Step3MultiStep from './steps/Step3MultiStep';
import Step4TwoMinutes from './steps/Step4TwoMinutes';
import Step5Delegate from './steps/Step5Delegate';
import Step6Schedule from './steps/Step6Schedule';
import { X } from 'lucide-react';

const ProcessingWizard: React.FC = () => {
  const { currentProcessing, cancelProcessing } = useProcessContext();
  
  if (!currentProcessing) return null;

  const { task, currentStep } = currentProcessing;
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1What task={task} />;
      case 2:
        return <Step2ActionRequired task={task} />;
      case 3:
        return <Step3MultiStep task={task} />;
      case 4:
        return <Step4TwoMinutes task={task} />;
      case 5:
        return <Step5Delegate task={task} />;
      case 6:
        return <Step6Schedule task={task} />;
      default:
        return null;
    }
  };

  const stepDescriptions = [
    { number: 1, title: "それは何か？", description: "このアイテムの内容を明確にする" },
    { number: 2, title: "すぐ行動する必要があるか？", description: "行動を起こす必要があるか判断する" },
    { number: 3, title: "次に取るべき行動は1つ？", description: "複数のアクションが必要か？" },
    { number: 4, title: "2分以内でできるか？", description: "すぐに完了できるか？" },
    { number: 5, title: "自分でするべき？", description: "他の人に任せられるか？" },
    { number: 6, title: "特定の日にやるべきか？", description: "特定の日に実行する必要があるか？" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate mr-4">
            処理中: {task.title}
          </h2>
          <button
            onClick={cancelProcessing}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-6">
            {/* Progress Steps */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between relative overflow-x-auto pb-2">
                {stepDescriptions.map((step) => (
                  <div 
                    key={step.number} 
                    className="flex flex-col items-center z-10 min-w-0 flex-shrink-0 mx-1"
                  >
                    <div 
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                        ${currentStep === step.number 
                          ? 'bg-blue-500 text-white' 
                          : currentStep > step.number 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'}`}
                    >
                      {currentStep > step.number ? '✓' : step.number}
                    </div>
                    <span className="text-xs mt-1 sm:mt-2 text-center hidden sm:block max-w-20 leading-tight">
                      {step.title}
                    </span>
                  </div>
                ))}
                
                <div className="absolute top-3 sm:top-4 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(currentStep - 1) * 20}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Mobile step title */}
              <div className="sm:hidden mt-4 text-center">
                <h3 className="text-sm font-medium text-gray-800">
                  ステップ {currentStep}: {stepDescriptions[currentStep - 1].title}
                </h3>
              </div>
            </div>
            
            {/* Desktop step title and description */}
            <div className="mb-4 sm:mb-6 hidden sm:block">
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                {stepDescriptions[currentStep - 1].title}
              </h3>
              <p className="text-gray-600 text-sm">
                <strong>ヒント:</strong> {stepDescriptions[currentStep - 1].description}
              </p>
            </div>
            
            {/* Step Content */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingWizard;