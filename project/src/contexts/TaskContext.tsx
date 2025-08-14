import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Task, Project, TaskStatus } from '../types';
import { generateId } from '../utils/helpers';
import { isToday } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { supabase } from '../lib/supabase';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'created'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  addProject: (project: Omit<Project, 'id' | 'created' | 'progress'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getProjectTasks: (projectId: string) => Task[];
  moveTaskToStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  moveProjectToInbox: (projectId: string) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;
  permanentlyDeleteProject: (projectId: string) => Promise<void>;
  permanentlyDeleteAllTasks: () => Promise<void>;
  restoreAllTasks: () => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { canCreateTask, canCreateProject, incrementTaskUsage, incrementProjectUsage } = useSubscription();

  // データの初期読み込み
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
    } else {
      setTasks([]);
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  // タスクの取得
  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null) // 論理削除されていないもののみ
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedTasks = (data || []).map((task: any) => ({
        ...task,
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        timeEstimate: task.time_estimate,
        energyLevel: task.energy_level,
        context: task.context,
        assignedTo: task.assigned_to,
        projectId: task.project_id, // プロジェクトIDを正しく設定
        created: new Date(task.created_at),
        updated: task.updated_at ? new Date(task.updated_at) : undefined,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        scheduledDate: task.scheduled_date ? new Date(task.scheduled_date) : undefined,
        completedDate: task.completed_at ? new Date(task.completed_at) : undefined,
      }));

      setTasks(parsedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // プロジェクトの取得
  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .is('archived_at', null) // アーカイブされていないもののみ
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedProjects = (data || []).map((project: any) => ({
        ...project,
        created: new Date(project.created_at),
        updated: project.updated_at ? new Date(project.updated_at) : undefined,
        completedDate: project.completed_at ? new Date(project.completed_at) : undefined,
        archivedAt: project.archived_at ? new Date(project.archived_at) : undefined,
        tasks: [], // プロジェクトのタスクIDは別途取得
      }));

      setProjects(parsedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // タスクの追加
  const addTask = async (task: Omit<Task, 'id' | 'created'>) => {
    if (!user) throw new Error('User not authenticated');
    
    // Check usage limits for free users
    if (!canCreateTask) {
      throw new Error('今月のタスク作成上限に達しました。Proプランにアップグレードしてください。');
    }

    const newTask: Task = {
      ...task,
      id: generateId(),
      created: new Date(),
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          id: newTask.id,
          user_id: user.id,
          project_id: newTask.projectId,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          time_estimate: newTask.timeEstimate,
          energy_level: newTask.energyLevel,
          context: newTask.context,
          assigned_to: newTask.assignedTo,
          due_date: newTask.dueDate?.toISOString().split('T')[0],
          scheduled_date: newTask.scheduledDate?.toISOString().split('T')[0],
        });

      if (error) throw error;

      setTasks(prev => [newTask, ...prev]);
      
      // Increment usage for free users
      await incrementTaskUsage();
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // タスクの更新
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.timeEstimate !== undefined) updateData.time_estimate = updates.timeEstimate;
      if (updates.energyLevel !== undefined) updateData.energy_level = updates.energyLevel;
      if (updates.context !== undefined) updateData.context = updates.context;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
      if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString().split('T')[0];
      if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate?.toISOString().split('T')[0];
      if (updates.completedDate !== undefined) updateData.completed_at = updates.completedDate?.toISOString();
      if (updates.deletedAt !== undefined) updateData.deleted_at = updates.deletedAt?.toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updated: new Date() } 
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // タスクの削除
  const deleteTask = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // ステータス別タスク取得
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  // タスクのステータス移動
  const moveTaskToStatus = async (taskId: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status };
    
    // 予定済みに移動する場合、今日の日付を設定
    if (status === 'scheduled') {
      updates.scheduledDate = new Date();
    }
    
    await updateTask(taskId, updates);
  };

  // プロジェクトの追加
  const addProject = async (project: Omit<Project, 'id' | 'created' | 'progress'>) => {
    if (!user) throw new Error('User not authenticated');
    
    // Check usage limits for free users
    if (!canCreateProject) {
      throw new Error('今月のプロジェクト作成上限に達しました。Proプランにアップグレードしてください。');
    }

    const newProject: Project = {
      ...project,
      id: generateId(),
      created: new Date(),
      progress: 0,
    };

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          id: newProject.id,
          user_id: user.id,
          title: newProject.title,
          description: newProject.description,
          status: 'active',
          progress: 0,
        });

      if (error) throw error;

      setProjects(prev => [newProject, ...prev]);
      
      // Increment usage for free users
      await incrementProjectUsage();
      
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  // プロジェクトの更新
  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          progress: updates.progress,
          completed_at: updates.completedDate?.toISOString(),
          archived_at: updates.archivedAt?.toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => 
        prev.map(project => 
          project.id === id 
            ? { ...project, ...updates, updated: new Date() } 
            : project
        )
      );
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // プロジェクトの削除（ゴミ箱に移動）
  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const project = getProject(id);
    if (!project) return;

    try {
      // プロジェクトの詳細でタスクを作成（ゴミ箱に）
      await addTask({
        title: `[削除済みプロジェクト] ${project.title}`,
        description: project.description,
        status: 'deleted',
      });

      // 関連タスクをゴミ箱に移動
      const projectTasks = getProjectTasks(id);
      for (const task of projectTasks) {
        await updateTask(task.id, { 
          status: 'deleted', 
          projectId: undefined 
        });
      }

      // プロジェクトをデータベースから削除
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  // プロジェクト取得
  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  // プロジェクトのタスク取得
  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  // プロジェクトをインボックスに移動
  const moveProjectToInbox = async (projectId: string) => {
    const project = getProject(projectId);
    if (!project) return;

    // プロジェクトの詳細でタスクを作成
    await addTask({
      title: project.title,
      description: project.description,
      status: 'inbox',
    });

    // 関連タスクをインボックスに移動
    const projectTasks = getProjectTasks(projectId);
    for (const task of projectTasks) {
      await updateTask(task.id, { 
        status: 'inbox', 
        projectId: undefined 
      });
    }

    // プロジェクトを削除
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) throw error;

    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  // プロジェクト完了
  const completeProject = async (projectId: string) => {
    const project = getProject(projectId);
    if (!project) return;

    try {
      // プロジェクトの詳細で完了済みタスクを作成
      await addTask({
        title: `[完了済みプロジェクト] ${project.title}`,
        description: project.description,
        status: 'completed',
        completedDate: new Date(),
      });

      // 関連タスクを完了に
      const projectTasks = getProjectTasks(projectId);
      for (const task of projectTasks) {
        if (task.status !== 'completed') {
          await updateTask(task.id, { 
            status: 'completed', 
            completedDate: new Date(),
            projectId: undefined
          });
        }
      }

      // プロジェクトをデータベースから削除
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error completing project:', error);
      throw error;
    }
  };

  // プロジェクト完全削除（使用しない）
  const permanentlyDeleteProject = async (projectId: string) => {
    // 関連タスクを削除済みに
    const projectTasks = getProjectTasks(projectId);
    for (const task of projectTasks) {
      await updateTask(task.id, { 
        status: 'deleted', 
        projectId: undefined 
      });
    }

    // プロジェクトを削除
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) throw error;

    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  // 削除済みタスクを全て完全削除
  const permanentlyDeleteAllTasks = async () => {
    if (!user) throw new Error('User not authenticated');

    const deletedTasks = getTasksByStatus('deleted');
    if (deletedTasks.length === 0) return;

    try {
      // データベースから削除済みタスクを全て削除
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'deleted');

      if (error) throw error;

      // ローカル状態から削除済みタスクを除去
      setTasks(prev => prev.filter(task => task.status !== 'deleted'));
    } catch (error) {
      console.error('Error permanently deleting all tasks:', error);
      throw error;
    }
  };

  // 削除済みタスクを全てインボックスに復元
  const restoreAllTasks = async () => {
    if (!user) throw new Error('User not authenticated');

    const deletedTasks = getTasksByStatus('deleted');
    if (deletedTasks.length === 0) return;

    try {
      // データベースで削除済みタスクを全てインボックスに移動
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'inbox' })
        .eq('user_id', user.id)
        .eq('status', 'deleted');

      if (error) throw error;

      // ローカル状態を更新
      setTasks(prev => 
        prev.map(task => 
          task.status === 'deleted' 
            ? { ...task, status: 'inbox' as TaskStatus, updated: new Date() }
            : task
        )
      );
    } catch (error) {
      console.error('Error restoring all tasks:', error);
      throw error;
    }
  };

  // 個別タスクをインボックスに復元
  const restoreTask = async (taskId: string) => {
    await updateTask(taskId, { status: 'inbox' });
  };
  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      loading,
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
      permanentlyDeleteAllTasks,
      restoreAllTasks,
      restoreTask,
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