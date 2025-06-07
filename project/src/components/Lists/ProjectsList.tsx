import React, { useState } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layers, Clock, Split, ChevronDown, MoveLeft, Trash2, CheckCircle, ArrowRight, User, Calendar, Archive, MoreVertical } from 'lucide-react';
import { Project, Task, TaskStatus } from '../../types';
import TaskItem from '../common/TaskItem';

interface TaskStatusDropdownProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ task, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: { value: TaskStatus; label: string; color: string; bgColor: string }[] = [
    { value: 'next', label: '次のアクション', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    { value: 'waiting', label: '待ち項目', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    { value: 'scheduled', label: '予定済み', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    { value: 'someday', label: 'いつか/たぶん', color: 'text-teal-700', bgColor: 'bg-teal-100' },
    { value: 'reference', label: '参考資料', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  ];

  const getCurrentStatusInfo = () => {
    const currentOption = statusOptions.find(option => option.value === task.status);
    return currentOption || { label: '次のアクション', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  };

  const currentStatus = getCurrentStatusInfo();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${currentStatus.bgColor} ${currentStatus.color} hover:opacity-80 transition-opacity`}
      >
        {currentStatus.label}
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${option.color}`}
              >
                {option.label}に移動
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface ProjectActionsDropdownProps {
  project: Project;
  onBreakdown: () => void;
}

const ProjectActionsDropdown: React.FC<ProjectActionsDropdownProps> = ({ project, onBreakdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { moveProjectToInbox, completeProject, permanentlyDeleteProject } = useTaskContext();

  const handleMoveToInbox = () => {
    moveProjectToInbox(project.id);
    setIsOpen(false);
  };

  const handleComplete = () => {
    completeProject(project.id);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm('このプロジェクトと関連するすべてのタスクを削除しますか？')) {
      permanentlyDeleteProject(project.id);
      setIsOpen(false);
    }
  };

  const handleBreakdown = () => {
    onBreakdown();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
        title="プロジェクトアクション"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
            <button
              onClick={handleBreakdown}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-green-600"
            >
              <Split className="w-4 h-4 mr-2" />
              タスクに分割
            </button>
            
            <div className="border-t border-gray-200 my-1" />
            
            <button
              onClick={handleMoveToInbox}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-600"
            >
              <MoveLeft className="w-4 h-4 mr-2" />
              インボックスに戻す
            </button>
            
            <button
              onClick={handleComplete}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              プロジェクト完了
            </button>
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              プロジェクト削除
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface BreakdownModalProps {
  project: Project;
  onClose: () => void;
}

const BreakdownModal: React.FC<BreakdownModalProps> = ({ project, onClose }) => {
  const [tasks, setTasks] = useState<string[]>(['']);
  const { addTask } = useTaskContext();

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validTasks = tasks.filter(task => task.trim() !== '');
    
    validTasks.forEach(taskTitle => {
      addTask({
        title: taskTitle,
        status: 'next',
        projectId: project.id,
      });
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            プロジェクトを分割: {project.title}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              このプロジェクトを具体的なタスクに分割しましょう。
              各タスクは明確で実行可能な単位にしてください。
            </p>
            
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder="タスクを入力"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={handleAddTask}
              className="mt-4 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              タスクを追加
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              タスクを作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsList: React.FC = () => {
  const { projects, getProjectTasks } = useTaskContext();
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Layers className="w-6 h-6 mr-2 text-green-500" />
          {t('projects')}
        </h1>
        <p className="text-gray-600">
          計画が必要な複数のステップからなるタスク
        </p>
      </div>
      
      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptyProjects')}</h3>
          <p className="text-gray-500 max-w-md">
            プロジェクトはまだありません。
            計画が必要な複数ステップのタスクがここに表示されます。
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            プロジェクト ({projects.length})
          </h2>
          
          <div className="space-y-4">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onBreakdown={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>
      )}
      
      {selectedProject && (
        <BreakdownModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: Project;
  onBreakdown: () => void;
}> = ({ project, onBreakdown }) => {
  const { getProjectTasks, updateTask } = useTaskContext();
  const projectTasks = getProjectTasks(project.id);
  
  const relatedTasks = projectTasks.filter(task => 
    task.status !== 'project' && 
    task.projectId === project.id
  );
  
  // Separate active and completed tasks
  const activeTasks = relatedTasks.filter(task => task.status !== 'completed');
  const completedTasks = relatedTasks.filter(task => task.status === 'completed');
  
  const completionPercentage = relatedTasks.length > 0 
    ? Math.round((completedTasks.length / relatedTasks.length) * 100) 
    : 0;

  const isProjectCompleted = project.completedDate !== undefined;

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { 
      status: newStatus
    });
  };

  const handleComplete = (taskId: string) => {
    updateTask(taskId, { 
      status: 'completed',
      completedDate: new Date()
    });
  };

  const handleReturnToInbox = (taskId: string) => {
    updateTask(taskId, {
      status: 'inbox',
      projectId: undefined
    });
  };

  const handleDelete = (taskId: string) => {
    updateTask(taskId, {
      status: 'deleted',
      projectId: undefined
    });
  };

  const renderTaskCard = (task: Task, isCompleted: boolean = false) => (
    <div key={task.id} className={`p-3 rounded-lg border ${
      isCompleted 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h5 className={`font-medium ${
              isCompleted 
                ? 'text-green-800 line-through' 
                : 'text-gray-800'
            }`}>
              {task.title}
            </h5>
            {isCompleted && (
              <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
            )}
          </div>
          
          {task.description && (
            <p className={`text-sm mb-2 line-clamp-2 ${
              isCompleted 
                ? 'text-green-600' 
                : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center mt-2">
            {!isCompleted && (
              <TaskStatusDropdown
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
              />
            )}
            
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                完了済み
              </span>
            )}
            
            {task.timeEstimate && (
              <span className="text-xs text-gray-500 ml-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.timeEstimate}分
              </span>
            )}
            
            {isCompleted && task.completedDate && (
              <span className="text-xs text-green-600 ml-2">
                完了日: {task.completedDate.toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1 ml-3">
          {!isCompleted && task.status !== 'inbox' && task.status !== 'deleted' && (
            <button 
              onClick={() => handleReturnToInbox(task.id)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              title="インボックスに戻す"
            >
              <MoveLeft className="w-4 h-4" />
            </button>
          )}

          {!isCompleted && task.status !== 'deleted' && (
            <button 
              onClick={() => handleComplete(task.id)}
              className="p-1 rounded-full hover:bg-green-100 text-green-600"
              title="完了としてマーク"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {task.status !== 'deleted' && (
            <button 
              onClick={() => handleDelete(task.id)}
              className="p-1 rounded-full hover:bg-red-100 text-red-600"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-shadow p-4 ${
      isProjectCompleted 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <h3 className={`font-medium ${
            isProjectCompleted 
              ? 'text-green-800 line-through' 
              : 'text-gray-800'
          }`}>
            {project.title}
          </h3>
          {isProjectCompleted && (
            <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
          )}
        </div>
        <ProjectActionsDropdown project={project} onBreakdown={onBreakdown} />
      </div>
      
      {project.description && (
        <p className={`text-sm mb-3 ${
          isProjectCompleted 
            ? 'text-green-600' 
            : 'text-gray-600'
        }`}>
          {project.description}
        </p>
      )}
      
      {isProjectCompleted && project.completedDate && (
        <div className="mb-3">
          <span className="text-sm text-green-600">
            完了日: {project.completedDate.toLocaleDateString('ja-JP')}
          </span>
        </div>
      )}
      
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">進捗</span>
          <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isProjectCompleted ? 'bg-green-500' : 'bg-green-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <span>{relatedTasks.length}個中{completedTasks.length}個完了</span>
      </div>
      
      {relatedTasks.length > 0 && (
        <div className="mt-4 space-y-3">
          {/* Active tasks */}
          {activeTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-1" />
                進行中のタスク ({activeTasks.length})
              </h4>
              <div className="space-y-2">
                {activeTasks.map(task => renderTaskCard(task, false))}
              </div>
            </div>
          )}
          
          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                完了済みタスク ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map(task => renderTaskCard(task, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;