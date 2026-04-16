/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import RecordModal from './components/RecordModal';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Recommend from './pages/Recommend';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'feed': return <Feed />;
      case 'recommend': return <Recommend />;
      case 'mypage': return <MyPage />;
      default: return <Home />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0a0b10] relative">
      <TopBar />
      <main className="min-h-[calc(100vh-144px)]">
        {renderContent()}
      </main>
      <BottomBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onRecordClick={() => setIsRecordModalOpen(true)} 
      />
      <RecordModal 
        isOpen={isRecordModalOpen} 
        onClose={() => setIsRecordModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
