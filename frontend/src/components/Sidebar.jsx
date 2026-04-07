import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from './Icon';

import logo from '../assets/logo.png';

const MenuItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden mb-2
        ${active
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-[0_0_20px_rgba(34,211,238,0.15)] border border-cyan-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
    >
        {/* Active Glow Indicator */}
        {active && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-r-full"></div>
        )}

        {/* Hover Glow Effect */}
        {!active && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}

        <div className={`relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${active ? 'text-cyan-400' : ''}`}>
            <Icon name={icon} size={22} />
        </div>
        <span className={`font-bold text-sm tracking-wide relative z-10 transition-all duration-300 ${active ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
            {label}
        </span>

        {/* Active Sparkle */}
        {active && (
            <div className="absolute right-4">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
            </div>
        )}
    </button>
);

export const Sidebar = () => {
    const { logout, user } = useGlobal();
    const navigate = useNavigate();
    const location = useLocation();

    // Get initials for avatar
    const isDefaultName = user?.name?.toLowerCase() === 'user';
    const userName = (isDefaultName ? (user?.email?.split('@')[0] || 'Admin') : user?.name) || 'Admin';
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="w-72 h-[calc(100vh-2rem)] m-4 flex flex-col p-6 border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl transition-all duration-500 relative z-50 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-8 pl-2 group cursor-pointer">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-990 rounded-xl blur-lg opacity-15 group-hover:opacity-20 transition-opacity-10 duration-500 animate-pulse-slow"></div>
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative z-10">
                        <img src={logo} alt="MetaVogue Logo" className="w-full h-full object-contain " />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        MetaVogue
                    </h1>
                    <p className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase opacity-80">AI Studio</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Menu</p>

                <MenuItem icon="Home" label="Dashboard" onClick={() => navigate('/home')} active={location.pathname.startsWith('/admin') || location.pathname === '/home'} />
                <MenuItem icon="TrendingUp" label="Analytics" onClick={() => navigate('/analytics')} active={location.pathname === '/analytics'} />
                <MenuItem icon="Clipboard" label="Work Tracking" onClick={() => navigate('/work-tracking')} active={location.pathname === '/work-tracking'} />
                <MenuItem icon="Box" label="Orders" onClick={() => navigate('/orders')} active={location.pathname === '/orders'} />
                <MenuItem icon="Users" label="User Management" onClick={() => navigate('/admin-users')} active={location.pathname === '/admin-users'} />

                <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-4">Tools</p>
                <MenuItem icon="Cube" label="Model Studio" onClick={() => navigate('/model')} active={location.pathname === '/model'} />
                <MenuItem icon="Banana" label="Nano Banana" onClick={() => navigate('/nano-banana')} active={location.pathname === '/nano-banana'} />
                <MenuItem icon="Cpu" label="Feature Extractor" onClick={() => navigate('/feature-extractor')} active={location.pathname === '/feature-extractor'} />
                <MenuItem icon="Video" label="Video Gen" onClick={() => navigate('/video')} active={location.pathname === '/video'} />
            </nav>

            {/* User Profile Card */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="relative group cursor-pointer" onClick={() => navigate('/my-tasks')}>
                    {/* Glass Card Background */}
                    <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/10 group-hover:-translate-y-1"></div>

                    <div className="relative p-3 flex items-center gap-3 z-10">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md overflow-hidden text-white font-bold text-sm">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{user?.name || user?.email || 'Admin'}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); logout(); }}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Icon name="LogOut" size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
