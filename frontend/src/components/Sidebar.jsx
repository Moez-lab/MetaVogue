import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from './Icon';

import logo from '../assets/logo.png';

const MenuItem = ({ icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden mb-2
        ${collapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 p-3.5 rounded-2xl'}
        ${active
                ? 'sidebar-gradient-bg text-white shadow-[0_0_20px_rgba(34,211,238,0.15)] border border-cyan-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
        title={collapsed ? label : ''}
    >
        {/* Elegant Active Side Highlight */}
        {active && (
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-cyan-400 active-indicator-glow rounded-r-full z-20"></div>
        )}

        {/* Hover Glow Effect */}
        {!active && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}

        <div className={`relative z-10 transition-all duration-500 group-hover:scale-110 ${active ? 'text-cyan-400' : ''}`}>
            <Icon name={icon} size={collapsed ? 24 : 22} />
        </div>

        <span className={`font-bold text-sm tracking-widest relative z-10 sidebar-label-transition ${active ? 'text-white' : ''} ${collapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
            {label}
        </span>
    </button>
);

export const Sidebar = () => {
    const { logout, user } = useGlobal();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Get initials for avatar
    const isDefaultName = user?.name?.toLowerCase() === 'user';
    const userName = (isDefaultName ? (user?.email?.split('@')[0] || 'Admin') : user?.name) || 'Admin';
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const menuItems = [
        { icon: "Home", label: "Dashboard", path: "/home", activePaths: ['/admin', '/home'] },
        { icon: "TrendingUp", label: "Analytics", path: "/analytics" },
        { icon: "Clipboard", label: "Work Tracking", path: "/work-tracking" },
        { icon: "Box", label: "Orders", path: "/orders" },
        { icon: "Users", label: "User Management", path: "/admin-users" },
    ];

    const toolItems = [
        { icon: "Cube", label: "Model Studio", path: "/model" },
        { icon: "Shirt", label: "Vogue Changer", path: "/vogue-changer" },
        { icon: "Sparkles", label: "Image Generator", path: "/image-generator" },
        { icon: "Cpu", label: "Feature Extractor", path: "/feature-extractor" },

        { icon: "Video", label: "Video Gen", path: "/video" },
    ];

    return (
        <div className={`h-[calc(100vh-2rem)] m-4 flex flex-col p-4 glass-premium rounded-[2.5rem] sidebar-transition relative z-50 shadow-2xl ${isCollapsed ? 'w-24' : 'w-72'}`}>
            
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-12 w-6 h-12 rounded-lg glass-premium text-cyan-400 flex items-center justify-center shadow-lg border border-cyan-500/20 hover:text-white hover:bg-cyan-500/20 transition-all z-50 ml-2"
            >
                <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={18} />
            </button>

            <div className={`flex items-center gap-4 mb-12 transition-all duration-500 ${isCollapsed ? 'justify-center pl-0' : 'pl-4'} group cursor-pointer`} onClick={() => navigate('/home')}>
                {!isCollapsed && (
                    <div className="animate-fade-in text-left">
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                            MetaVogue
                        </h1>
                    </div>
                )}
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="w-10 h-10 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <img src={logo} alt="MetaVogue Logo" className="w-full h-full object-contain filter contrast-125" />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto px-2 custom-scrollbar no-scrollbar">
                <p className={`text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 scale-0' : 'px-4 opacity-100'}`}>
                    Menu
                </p>

                {menuItems.map(item => (
                    <MenuItem 
                        key={item.label}
                        icon={item.icon} 
                        label={item.label} 
                        collapsed={isCollapsed}
                        onClick={() => navigate(item.path)} 
                        active={item.activePaths ? item.activePaths.some(p => location.pathname.startsWith(p)) : location.pathname === item.path} 
                    />
                ))}

                <p className={`text-xs font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 scale-0' : 'px-4 opacity-100'}`}>
                    Tools
                </p>

                {toolItems.map(item => (
                    <MenuItem 
                        key={item.label}
                        icon={item.icon} 
                        label={item.label} 
                        collapsed={isCollapsed}
                        onClick={() => navigate(item.path)} 
                        active={location.pathname === item.path} 
                    />
                ))}
            </nav>

            {/* User Profile Card */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div 
                    className={`relative group cursor-pointer transition-all duration-500 overflow-hidden ${isCollapsed ? 'rounded-xl' : 'rounded-2xl'}`}
                    onClick={() => navigate('/my-tasks')}
                >
                    {/* Dark Glass Card Background */}
                    <div className="absolute inset-0 glass-premium border border-white/5 shadow-sm transition-all duration-300 group-hover:bg-white/5"></div>

                    <div className={`relative p-3 flex items-center z-10 transition-all duration-500 ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}`}>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-[#0b0d17] shadow-lg text-white font-bold text-sm">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#161b22] rounded-full"></div>
                        </div>
                        
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                    {user?.name || user?.email?.split('@')[0] || 'Admin'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Premium Agent</p>
                            </div>
                        )}

                        {!isCollapsed && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); logout(); }}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <Icon name="LogOut" size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
