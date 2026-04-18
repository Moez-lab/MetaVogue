import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from './context/GlobalContext';
import { Sidebar } from './components/Sidebar';
import { BrandiesSidebar } from './components/BrandiesSidebar';
import { TopBar } from './components/TopBar';
import { AIAssistantWidget } from './components/AIAssistantWidget';
// ── Shared Views ────────────────────────────────────────────────────
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
// Imports moved to Admin Views section
// ── Admin Views ─────────────────────────────────────────────────────
import { HomeView } from './views/admin/HomeView';
import { WorkTrackingView } from './views/admin/WorkTrackingView';
import { OrdersView } from './views/admin/OrdersView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AnalyticsView } from './views/admin/AnalyticsView';
import { MyTasksView } from './views/admin/MyTasksView';
import { ModelStudioView } from './views/admin/ModelStudioView';
import { UploadStudioView } from './views/admin/UploadStudioView';
import { VideoStudioView } from './views/admin/VideoStudioView';
import { TextureStudioView } from './views/admin/TextureStudioView';
import { FeatureExtractorView } from './views/admin/FeatureExtractorView';
import { NanoBananaView } from './views/admin/NanoBananaView';
// ── Customer Views ───────────────────────────────────────────────────
import { BrandiesView } from './views/customer/BrandiesView';
import { MyOrdersView } from './views/customer/MyOrdersView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';

// ── Protected Layout ─────────────────────────────────────────────────
// Displayed for all authenticated routes. Renders shared chrome (sidebar,
// topbar) and an <Outlet /> where child route components appear.
const ProtectedLayout = () => {
  const { isAuthenticated, user } = useGlobal();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full relative overflow-hidden font-sans bg-slate-50 dark:bg-black">
      {/* Premium Glass Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[80px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-600/15 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-500/10 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>
        
        {/* Subtle noise overlay (using translucent black for texture) */}
        <div className="absolute inset-0 bg-black/[0.02] opacity-20 pointer-events-none"></div>
      </div>

      {user?.isAdmin ? <Sidebar /> : <BrandiesSidebar />}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 mt-4 mr-4 mb-4 rounded-[2.5rem] glass-premium sidebar-transition shadow-2xl">
        <TopBar />
        <main className="flex-1 overflow-y-auto transition-colors duration-500 no-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Global Floating AI Assistant */}
      {location.pathname === '/brandies' && <AIAssistantWidget />}
    </div>
  );
};

// ── App ──────────────────────────────────────────────────────────────
const App = () => {
  const { isAuthenticated, user } = useGlobal();
  const navigate = useNavigate();

  const isAdmin = user?.email?.toLowerCase() === 'mueezzakir6@gmail.com' || user?.isAdmin;
  const homePath = isAdmin ? '/home' : '/brandies';

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <LandingView
            onGetStarted={() => navigate('/login')}
            onSignIn={() => navigate('/login')}
          />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={homePath} replace />
            : <LoginView onBack={() => navigate('/')} />
        }
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordView onBack={() => navigate('/login')} />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordView />}
      />

      {/* Protected routes — all rendered inside ProtectedLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/home"              element={<HomeView />} />
        <Route path="/admin/:adminName"  element={<HomeView />} />
        <Route path="/model"             element={<ModelStudioView />} />
        <Route path="/upload"            element={<UploadStudioView />} />
        <Route path="/video"             element={<VideoStudioView />} />
        <Route path="/texture"           element={<TextureStudioView />} />
        <Route path="/work-tracking"     element={<WorkTrackingView />} />
        <Route path="/my-tasks"          element={<MyTasksView />} />
        <Route path="/brandies"          element={<BrandiesView />} />
        <Route path="/orders"            element={<OrdersView />} />
        <Route path="/admin-users"       element={<AdminUsersView />} />
        <Route path="/feature-extractor" element={<FeatureExtractorView />} />
        <Route path="/analytics"         element={<AnalyticsView />} />
        <Route path="/my-orders"         element={<MyOrdersView />} />
        <Route path="/nano-banana"       element={<NanoBananaView />} />
        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Route>
    </Routes>
  );
};

export default App;

