import { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from './Icon';

export const TopBar = () => {
    const { theme, toggleTheme, unreadNotifications, setCurrentView, orders, user, markNotificationsAsRead } = useGlobal();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = () => {
        setCurrentView('orders');
        setShowNotifications(false);
    };

    const handleBellClick = () => {
        if (!showNotifications) {
            markNotificationsAsRead();
        }
        setShowNotifications(!showNotifications);
    };

    // Show recent 5 orders so the list doesn't disappear when marked as read
    const recentOrders = orders.slice(0, 5);

    return (
        <div className="h-20 flex items-center justify-between px-8 transition-colors duration-500 sticky top-0 z-40 bg-transparent">
            {/* Status Pill */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-premium border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-emerald-400 tracking-wider uppercase">
                        System Online
                    </span>
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-white/10"></div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">v2.4.0</span>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-4">
                {/* Notification Bell - Admin Only */}
                {user?.email === 'mueezzakir6@gmail.com' && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={handleBellClick}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group relative"
                        >
                            <div className="relative z-10 text-slate-600 dark:text-slate-300 group-hover:text-cyan-400 transition-colors">
                                <Icon name="Bell" size={20} />
                            </div>

                            {unreadNotifications > 0 && (
                                <span className="absolute top-0 right-0 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-fade-in-up">
                                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                                    <span className="text-xs text-slate-500 dark:text-gray-400">Recent Updates</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map(order => (
                                            <div
                                                key={order.id}
                                                onClick={handleNotificationClick}
                                                className="p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!order.read ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                                            New Order from {order.brandName || 'Brand'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">
                                                            {new Date(order.date).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 dark:text-gray-500 text-sm">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 text-center">
                                    <button
                                        onClick={handleNotificationClick}
                                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                                    >
                                        View All Orders
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Premium Glass Theme Toggle */}
                <div className="relative flex items-center">
                    <button
                        onClick={toggleTheme}
                        className="group relative flex items-center h-10 w-24 rounded-full p-1 transition-all duration-500 glass-premium overflow-hidden border-white/10"
                    >
                        {/* Shifting Labels */}
                        <div className="absolute inset-0 flex items-center justify-between px-3 w-full pointer-events-none">
                            <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-500 ${theme === 'dark' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'} text-slate-400`}>
                                Dark
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-500 ${theme === 'light' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} text-slate-500`}>
                                Light
                            </span>
                        </div>

                        {/* Sliding Knob */}
                        <div 
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ease-out toggle-knob
                            ${theme === 'dark' ? 'translate-x-12' : 'translate-x-0'}`}
                        >
                            <div className={`transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 text-cyan-400' : 'rotate-180 text-amber-500'}`}>
                                {theme === 'dark' ? <Icon name="Moon" size={16} /> : <Icon name="Sun" size={16} />}
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};
