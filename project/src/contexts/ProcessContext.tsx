import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Task, ProcessingState, GTDStep } from '../types';
import { useTaskContext } from './TaskContext';

interface ProcessContextType {
  currentProcessing: ProcessingState | null;
  startProcessing: (task: Task) => void;
  completeStep: (step: GTDStep, decision: any) => void;
  cancelProcessing: () => void;
  getCurrentStep: () => GTDStep | null;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProcessing, setCurrentProcessing] = useState<ProcessingState | null>(null);
  const { updateTask, moveTaskToStatus, addProject } = useTaskContext();

  const startProcessing = (task: Task) => {
    setCurrentProcessing({
      task,
      currentStep: 1,
    });
  };

  const getCurrentStep = () => {
    return currentProcessing ? currentProcessing.currentStep : null;
  };

  const completeStep = (step: GTDStep, decision: any) => {
    if (!currentProcessing) return;
    
    const { task } = currentProcessing;
    
    switch(step) {
      case 1:
        setCurrentProcessing({
          task,
          currentStep: 2,
        });
        break;
        
      case 2:
        if (decision === 'yes') {
          setCurrentProcessing({
            task,
            currentStep: 3,
          });
        } else {
          switch (decision.subType) {
            case 'reference':
              moveTaskToStatus(task.id, 'reference');
              break;
            case 'someday':
              moveTaskToStatus(task.id, 'someday');
              break;
            case 'trash':
              moveTaskToStatus(task.id, 'deleted');
              break;
          }
          setCurrentProcessing(null);
        }
        break;
        
      case 3:
        if (decision === 'yes') {
          const newProject = addProject({
            title: task.title,
            description: task.description,
            tasks: [task.id],
          });
          updateTask(task.id, { 
            projectId: newProject.id,
            isMultiStep: true,
            status: 'project'
          });
          setCurrentProcessing(null);
        } else {
          setCurrentProcessing({
            task,
            currentStep: 4,
          });
        }
        break;
        
      case 4:
        if (decision === 'yes') {
          updateTask(task.id, { 
            status: 'completed',
            completedDate: new Date(),
            timeEstimate: 2
          });
          setCurrentProcessing(null);
        } else {
          updateTask(task.id, { 
            timeEstimate: decision.timeEstimate 
          });
          setCurrentProcessing({
            task,
            currentStep: 5,
          });
        }
        break;
        
      case 5:
        if (decision.yes) {
          updateTask(task.id, { 
            status: 'waiting',
            assignedTo: decision.person
          });
          setCurrentProcessing(null);
        } else {
          setCurrentProcessing({
            task,
            currentStep: 6,
          });
        }
        break;
        
      case 6:
        if (decision.yes) {
          updateTask(task.id, { 
            status: 'scheduled',
            dueDate: decision.date
          });
        } else {
          moveTaskToStatus(task.id, 'next');
        }
        setCurrentProcessing(null);
        break;
    }
  };

  const cancelProcessing = () => {
    setCurrentProcessing(null);
  };

  return (
    <ProcessContext.Provider value={{
      currentProcessing,
      startProcessing,
      completeStep,
      cancelProcessing,
      getCurrentStep,
    }}>
      {children}
    </ProcessContext.Provider>
  );
};

export const useProcessContext = () => {
  const context = useContext(ProcessContext);
  if (context === undefined) {
    throw new Error('useProcessContext must be used within a ProcessProvider');
  }
  return context;
};