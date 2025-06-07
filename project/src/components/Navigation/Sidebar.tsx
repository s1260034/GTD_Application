import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { Inbox, ArrowRight, User, Calendar, Layers, Clock, Archive, CheckCircle, Trash2, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { tasks } = useTaskContext();
  
  const { t } = useLanguage();
  const counts = {
    inbox: tasks.filter(t => t.status === 'inbox').length,
    next: tasks.filter(t => t.status === 'next').length,
    waiting: tasks.filter(t => t.status === 'waiting').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    project: tasks.filter(t => t.status === 'project').length,
    someday: tasks.filter(t => t.status === 'someday').length,
    reference: tasks.filter(t => t.status === 'reference').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    deleted: tasks.filter(t => t.status === 'deleted').length,
  };
  
  const navItems = [
    {
      to: '/',
      label: 'インボックス',
      icon: <Inbox className="w-5 h-5" />,
      color: 'text-gray-600',
      activeColor: 'bg-gray-100 text-gray-800',
      count: counts.inbox,
    },
    {
      to: '/next',
      label: '次のアクション',
      icon: <ArrowRight className="w-5 h-5" />,
      color: 'text-blue-600',
      activeColor: 'bg-blue-100 text-blue-800',
      count: counts.next,
    },
    {
      to: '/waiting',
      label: '待ち項目',
      icon: <User className="w-5 h-5" />,
      color: 'text-orange-600',
      activeColor: 'bg-orange-100 text-orange-800',
      count: counts.waiting,
    },
    {
      to: '/scheduled',
      label: '予定済み',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-purple-600',
      activeColor: 'bg-purple-100 text-purple-800',
      count: counts.scheduled,
    },
    {
      to: '/projects',
      label: 'プロジェクト',
      icon: <Layers className="w-5 h-5" />,
      color: 'text-green-600',
      activeColor: 'bg-green-100 text-green-800',
      count: counts.project,
    },
    {
      to: '/someday',
      label: 'いつか/たぶん',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-teal-600',
      activeColor: 'bg-teal-100 text-teal-800',
      count: counts.someday,
    },
    {
      to: '/reference',
      label: '参考資料',
      icon: <Archive className="w-5 h-5" />,
      color: 'text-indigo-600',
      activeColor: 'bg-indigo-100 text-indigo-800',
      count: counts.reference,
    },
    {
      type: 'divider'
    },
    {
      to: '/completed',
      label: '完了済み',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      activeColor: 'bg-green-100 text-green-800',
      count: counts.completed,
    },
    {
      to: '/deleted',
      label: 'ゴミ箱',
      icon: <Trash2 className="w-5 h-5" />,
      color: 'text-red-600',
      activeColor: 'bg-red-100 text-red-800',
      count: counts.deleted,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex-shrink-0 hidden md:block">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Focus Flow
            </h1>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-sm text-gray-600 font-medium">Mind Like Water</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">今日のタスク</span>
            <span className="text-lg font-bold text-blue-600">
              {counts.next + counts.scheduled}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((counts.completed / Math.max(1, counts.completed + counts.next + counts.scheduled)) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <nav className="py-4">
        <ul>
          {navItems.map((item, index) => {
            if (item.type === 'divider') {
              return <li key={`divider-${index}`} className="my-2 border-t border-gray-200" />;
            }

            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to} className="px-4 py-1">
                <Link
                  to={item.to}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? `${item.activeColor} shadow-sm border border-opacity-20` 
                      : 'hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`${isActive ? item.color : 'text-gray-500'} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </span>
                    <span className={`ml-3 ${isActive ? 'font-semibold' : 'font-medium'} transition-colors duration-200`}>
                      {item.label}
                    </span>
                  </div>
                  
                  {item.count > 0 && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-white bg-opacity-70 text-gray-700 shadow-sm' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;