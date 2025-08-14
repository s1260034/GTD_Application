import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface Translations {
  [key: string]: {
    en: string;
    ja: string;
  };
}

const translations: Translations = {
  inbox: {
    en: 'Inbox',
    ja: 'インボックス'
  },
  nextActions: {
    en: 'Next Actions',
    ja: '次のアクション'
  },
  waitingFor: {
    en: 'Waiting For',
    ja: '待ち項目'
  },
  scheduled: {
    en: 'Scheduled',
    ja: '予定済み'
  },
  projects: {
    en: 'Projects',
    ja: 'プロジェクト'
  },
  someday: {
    en: 'Someday/Maybe',
    ja: 'いつか/たぶん'
  },
  emptyInbox: {
    en: 'Your inbox is empty',
    ja: 'インボックスは空です',
  },
  emptyInboxDesc: {
    en: 'Add thoughts, ideas, and tasks to your inbox using the input field above.',
    ja: '上の入力フィールドを使って、考え、アイデア、タスクをインボックスに追加してください。',
  },
  emptyNextActions: {
    en: 'No next actions',
    ja: '次のアクションはありません',
  },
  emptyProjects: {
    en: 'No projects',
    ja: 'プロジェクトはありません',
  },
  emptySomeday: {
    en: 'No someday items',
    ja: '保留中のアイテムはありません',
  },
  emptyWaiting: {
    en: 'Nothing on hold',
    ja: '待ち項目はありません',
  },
  emptyScheduled: {
    en: 'No scheduled tasks',
    ja: '予定済みのタスクはありません',
  },
  addToInbox: {
    en: "Add to inbox... (What's on your mind?)",
    ja: 'インボックスに追加... (何か思いついたことは？)'
  },
  capture: {
    en: 'Capture',
    ja: '記録する'
  },
  addDetails: {
    en: 'Add details (optional)',
    ja: '詳細を追加 (任意)'
  },
  cancel: {
    en: 'Cancel',
    ja: 'キャンセル'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language] = useState<Language>('ja');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};