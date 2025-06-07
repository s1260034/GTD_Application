import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import { ProcessProvider } from './contexts/ProcessContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Navigation/Sidebar';
import MobileNavbar from './components/Navigation/MobileNavbar';
import InboxList from './components/Inbox/InboxList';
import NextActionsList from './components/Lists/NextActionsList';
import WaitingForList from './components/Lists/WaitingForList';
import ScheduledList from './components/Lists/ScheduledList';
import ProjectsList from './components/Lists/ProjectsList';
import SomedayList from './components/Lists/SomedayList';
import ReferenceList from './components/Lists/ReferenceList';
import CompletedList from './components/Lists/CompletedList';
import DeletedList from './components/Lists/DeletedList';
import ProcessingWizard from './components/Process/ProcessingWizard';

function App() {
  return (
    <LanguageProvider>
      <TaskProvider>
        <ProcessProvider>
          <Router>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
            
                <main className="flex-1 overflow-auto">
                  <MobileNavbar />
              
                  <div className="container mx-auto p-4 pt-20 md:pt-4 max-w-4xl h-full">
                    <Routes>
                      <Route path="/" element={<InboxList />} />
                      <Route path="/next" element={<NextActionsList />} />
                      <Route path="/waiting" element={<WaitingForList />} />
                      <Route path="/scheduled" element={<ScheduledList />} />
                      <Route path="/projects" element={<ProjectsList />} />
                      <Route path="/someday" element={<SomedayList />} />
                      <Route path="/reference" element={<ReferenceList />} />
                      <Route path="/completed" element={<CompletedList />} />
                      <Route path="/deleted" element={<DeletedList />} />
                    </Routes>
                  </div>
                </main>
                
                <ProcessingWizard />
              </div>
          </Router>
        </ProcessProvider>
      </TaskProvider>
    </LanguageProvider>
  );
}

export default App;