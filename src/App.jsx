import { useState } from 'react';
// Force HMR Update
import { useGlobal } from './context/GlobalContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HomeView } from './views/HomeView';
import { ModelStudioView } from './views/ModelStudioView';
import { UploadStudioView } from './views/UploadStudioView';
import { VideoStudioView } from './views/VideoStudioView';
import { TextureStudioView } from './views/TextureStudioView';
import { LoginView } from './views/LoginView';
import { LandingView } from './views/LandingView';

const App = () => {
  const { currentView, isAuthenticated } = useGlobal();
  const [showLogin, setShowLogin] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'model': return <ModelStudioView />;
      case 'upload': return <UploadStudioView />;
      case 'video': return <VideoStudioView />;
      case 'texture': return <TextureStudioView />;
      default: return <HomeView />;
    }
  };

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginView onBack={() => setShowLogin(false)} />;
    }
    return <LandingView onGetStarted={() => setShowLogin(true)} onSignIn={() => setShowLogin(true)} />;
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none blur-[80px] transition-opacity duration-500 hidden dark:block"
        style={{
          backgroundColor: 'var(--color-primary)',
          backgroundImage: `radial-gradient(at 40% 20%, var(--color-secondary) 0px, transparent 50%),
          radial-gradient(at 80% 0%, var(--color-primary) 0px, transparent 50%),
          radial-gradient(at 0% 50%, #ec4899 0px, transparent 50%)`
        }}
      ></div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 mt-4 mr-4 rounded-tl-3xl rounded-tr-3xl shadow-2xl bg-white dark:bg-[#050b14]">
        <TopBar />
        <main className="flex-1 overflow-y-auto transition-colors duration-500">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
