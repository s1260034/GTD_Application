import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { TaskProvider } from './contexts/TaskContext';
import { ProcessProvider } from './contexts/ProcessContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Sidebar from './components/Navigation/Sidebar';
import MobileNavbar from './components/Navigation/MobileNavbar';
import UserMenu from './components/Navigation/UserMenu';
import InboxList from './components/Inbox/InboxList';
import AllTasksList from './components/Lists/AllTasksList';
import NextActionsList from './components/Lists/NextActionsList';
import WaitingForList from './components/Lists/WaitingForList';
import ScheduledList from './components/Lists/ScheduledList';
import ProjectsList from './components/Lists/ProjectsList';
import SomedayList from './components/Lists/SomedayList';
import ReferenceList from './components/Lists/ReferenceList';
import CompletedList from './components/Lists/CompletedList';
import DeletedList from './components/Lists/DeletedList';
import ProcessingWizard from './components/Process/ProcessingWizard';
import PricingModal from './components/Subscription/PricingModal';
import SuccessPage from './components/Subscription/SuccessPage';
import CancelPage from './components/Subscription/CancelPage';
import UsageBanner from './components/Subscription/UsageBanner';

function App() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Subscription success/cancel pages - outside of protected routes */}
            <Route path="/subscription/success" element={<SuccessPage />} />
            <Route path="/subscription/cancel" element={<CancelPage />} />
            
            {/* Main app routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <SubscriptionProvider>
                  <TaskProvider>
                    <ProcessProvider>
                      <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                    
                        <main className="flex-1 overflow-auto relative">
                          <MobileNavbar />
                          
                          {/* Desktop User Menu - Top Right */}
                          <div className="hidden md:block fixed top-4 right-4 z-20">
                            <UserMenu onUpgrade={() => setShowPricing(true)} />
                          </div>
                      
                          <div className="container mx-auto p-4 pt-20 md:pt-16 max-w-4xl h-full">
                            <UsageBanner onUpgrade={() => setShowPricing(true)} />
                            
                            <Routes>
                              <Route path="/" element={<InboxList onUpgrade={() => setShowPricing(true)} />} />
                              <Route path="/search" element={<AllTasksList />} />
                              <Route path="/next" element={<NextActionsList />} />
                              <Route path="/waiting" element={<WaitingForList />} />
                              <Route path="/scheduled" element={<ScheduledList />} />
                              <Route path="/projects" element={<ProjectsList onUpgrade={() => setShowPricing(true)} />} />
                              <Route path="/someday" element={<SomedayList />} />
                              <Route path="/reference" element={<ReferenceList />} />
                              <Route path="/completed" element={<CompletedList />} />
                              <Route path="/deleted" element={<DeletedList />} />
                            </Routes>
                          </div>
                        </main>
                        
                        <ProcessingWizard />
                        <PricingModal 
                          isOpen={showPricing} 
                          onClose={() => setShowPricing(false)} 
                        />
                      </div>
                    </ProcessProvider>
                  </TaskProvider>
                </SubscriptionProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;