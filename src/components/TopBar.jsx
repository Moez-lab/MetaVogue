import { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from './Icon';

export const TopBar = () => {
    const { theme, toggleTheme, unreadNotifications, setCurrentView, orders, user } = useGlobal();
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

    const unreadOrders = orders.filter(order => !order.read);

    return (
        <div className="h-20 flex items-center justify-between px-8 transition-colors duration-500 sticky top-0 z-40">
            {/* Status Pill */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
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
                            onClick={() => setShowNotifications(!showNotifications)}
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
                                    <span className="text-xs text-slate-500 dark:text-gray-400">{unreadNotifications} unread</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {unreadOrders.length > 0 ? (
                                        unreadOrders.map(order => (
                                            <div
                                                key={order.id}
                                                onClick={handleNotificationClick}
                                                className="p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
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

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="relative z-10 text-slate-600 dark:text-yellow-400 transition-transform duration-500 rotate-0 dark:rotate-180">
                        {theme === 'dark' ? <Icon name="Sun" size={20} /> : <Icon name="Moon" size={20} />}
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </div>
        </div>
    );
};
