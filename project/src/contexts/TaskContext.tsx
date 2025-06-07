import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Task, Project, TaskStatus } from '../types';
import { generateId } from '../utils/helpers';
import { isToday } from '../utils/dateUtils';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'created'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  addProject: (project: Omit<Project, 'id' | 'created' | 'progress'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  getProjectTasks: (projectId: string) => Task[];
  moveTaskToStatus: (taskId: string, status: TaskStatus) => void;
  moveProjectToInbox: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  permanentlyDeleteProject: (projectId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('gtd-tasks');
    const savedProjects = localStorage.getItem('gtd-projects');
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        created: new Date(task.created),
        updated: task.updated ? new Date(task.updated) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
      }));
      setTasks(parsedTasks);
    }
    
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
        ...project,
        created: new Date(project.created),
        updated: project.updated ? new Date(project.updated) : undefined,
        completedDate: project.completedDate ? new Date(project.completedDate) : undefined,
      }));
      setProjects(parsedProjects);
    }
  }, []);

  // Auto-move today's scheduled tasks to next actions
  useEffect(() => {
    const moveTodayTasksToNext = () => {
      setTasks(prev => 
        prev.map(task => {
          if (task.status === 'scheduled' && task.dueDate && isToday(task.dueDate)) {
            return {
              ...task,
              status: 'next' as TaskStatus,
              updated: new Date()
            };
          }
          return task;
        })
      );
    };

    // Run immediately
    moveTodayTasksToNext();

    // Set up interval to check every minute
    const interval = setInterval(moveTodayTasksToNext, 60000);

    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage whenever tasks or projects change
  useEffect(() => {
    localStorage.setItem('gtd-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('gtd-projects', JSON.stringify(projects));
  }, [projects]);

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'created'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      created: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updated: new Date() } 
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const moveTaskToStatus = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  };

  // Project functions
  const addProject = (project: Omit<Project, 'id' | 'created' | 'progress'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      created: new Date(),
      progress: 0,
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updated: new Date() } 
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    // Delete project and update tasks that belonged to this project
    setProjects(prev => prev.filter(project => project.id !== id));
    setTasks(prev => 
      prev.map(task => 
        task.projectId === id 
          ? { ...task, projectId: undefined, updated: new Date() } 
          : task
      )
    );
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  // New project management functions
  const moveProjectToInbox = (projectId: string) => {
    const project = getProject(projectId);
    if (!project) return;

    // Create a new task in inbox with project details
    addTask({
      title: project.title,
      description: project.description,
      status: 'inbox',
    });

    // Move all related tasks to inbox and remove project association
    setTasks(prev => 
      prev.map(task => 
        task.projectId === projectId 
          ? { ...task, status: 'inbox', projectId: undefined, updated: new Date() } 
          : task
      )
    );

    // Delete the project
    deleteProject(projectId);
  };

  const completeProject = (projectId: string) => {
    const project = getProject(projectId);
    if (!project) return;

    // Mark project as completed
    updateProject(projectId, {
      progress: 100,
      completedDate: new Date(),
    });

    // Mark all related tasks as completed
    setTasks(prev => 
      prev.map(task => 
        task.projectId === projectId && task.status !== 'completed'
          ? { ...task, status: 'completed', completedDate: new Date(), updated: new Date() } 
          : task
      )
    );
  };

  const permanentlyDeleteProject = (projectId: string) => {
    // Move all related tasks to deleted status
    setTasks(prev => 
      prev.map(task => 
        task.projectId === projectId 
          ? { ...task, status: 'deleted', projectId: undefined, updated: new Date() } 
          : task
      )
    );

    // Delete the project
    deleteProject(projectId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      addTask,
      updateTask,
      deleteTask,
      getTasksByStatus,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      getProjectTasks,
      moveTaskToStatus,
      moveProjectToInbox,
      completeProject,
      permanentlyDeleteProject,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};