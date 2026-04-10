import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full relative overflow-hidden font-sans bg-slate-100 dark:bg-[#050b14]">
      {/* Ambient background gradient */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none blur-[80px] transition-opacity duration-500 hidden dark:block"
        style={{
          backgroundImage: `radial-gradient(at 40% 20%, var(--color-secondary) 0px, transparent 50%),
            radial-gradient(at 80% 0%, var(--color-primary) 0px, transparent 50%),
            radial-gradient(at 0% 50%, #ec4899 0px, transparent 50%)`
        }}
      />

      {user?.isAdmin ? <Sidebar /> : <BrandiesSidebar />}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 mt-4 mr-4 mb-4 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm bg-white dark:bg-[#050b14] transition-all duration-300">
        <TopBar />
        <main className="flex-1 overflow-y-auto transition-colors duration-500">
          <Outlet />
        </main>
      </div>

      {/* Global Floating AI Assistant - Stays on top of everything! */}
      <AIAssistantWidget />
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

