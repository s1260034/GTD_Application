import React, { useState } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layers, Clock, Split, ChevronDown, Trash2, CheckCircle, ArrowRight, User, Calendar, Archive, MoreVertical, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { Project, Task, TaskStatus } from '../../types';
import TaskItem from '../common/TaskItem';

interface ProjectActionsDropdownProps {
  project: Project;
  onBreakdown: () => void;
}

const ProjectActionsDropdown: React.FC<ProjectActionsDropdownProps> = ({ project, onBreakdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { moveProjectToInbox, completeProject, deleteProject } = useTaskContext();

  const handleMoveToInbox = () => {
    moveProjectToInbox(project.id);
    setIsOpen(false);
  };

  const handleComplete = () => {
    completeProject(project.id);
    setIsOpen(false);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    setIsOpen(false);
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
              ゴミ箱に移動
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
  onUpgrade: () => void;
}

const BreakdownModal: React.FC<BreakdownModalProps> = ({ project, onClose, onUpgrade }) => {
  const [tasks, setTasks] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const { addTask } = useTaskContext();
  const { canCreateTask } = useSubscription();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validTasks = tasks.filter(task => task.trim() !== '');
    
    if (!canCreateTask && validTasks.length > 0) {
      setError('今月のタスク作成上限に達しました。');
      return;
    }
    
    try {
      for (const taskTitle of validTasks) {
        await addTask({
          title: taskTitle,
          status: 'next',
          projectId: project.id,
        });
      }
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            プロジェクトを分割: {project.title}
          </h2>
        </div>
        
        {error && (
          <div className="p-4 border-b border-gray-200">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
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
          </div>
        )}
        
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
                    disabled={!canCreateTask}
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
              disabled={!canCreateTask}
              className={`mt-4 px-4 py-2 rounded-md flex items-center ${
                canCreateTask 
                  ? 'text-blue-500 hover:bg-blue-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
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
              disabled={!canCreateTask}
              className={`px-4 py-2 rounded-md ${
                canCreateTask
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              タスクを作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProjectsListProps {
  onUpgrade: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onUpgrade }) => {
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
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: Project;
  onBreakdown: () => void;
}> = ({ project, onBreakdown }) => {
  const { getProjectTasks } = useTaskContext();
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
                {activeTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                  />
                ))}
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
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showControls={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;