import { useState, useMemo } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';

export const AnalyticsView = () => {
    const { orders, users, allProjects } = useGlobal();
    const [timeRange, setTimeRange] = useState('all'); // all, year, month, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Calculate metrics from orders, projects, and users
    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Order Calculations
        let completedOrders = orders.filter(o => (o.status === 'Completed' || o.paymentStatus === 'Paid') && o.paymentStatus === 'Paid');
        
        // 2. Project Calculations
        let filteredProjects = allProjects;

        // Apply custom date range filter if selected
        if (timeRange === 'custom' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            completedOrders = completedOrders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate >= start && orderDate <= end;
            });

            filteredProjects = allProjects.filter(p => {
                const d = new Date(p.date || Date.now());
                return d >= start && d <= end;
            });
        }

        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const totalOrders = completedOrders.length;
        const totalProjects = filteredProjects.length;
        const totalUsers = users.length;

        // Generated Assets Count (Steps that are 'done')
        const generatedAssets = allProjects.reduce((sum, p) => {
            const stepsDone = Object.values(p.steps || {}).filter(s => s === 'done').length;
            return sum + stepsDone;
        }, 0);

        // Monthly data for charts
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            // Orders this month
            const mOrders = orders.filter(o => {
                const od = new Date(o.date);
                return od.getMonth() === month && od.getFullYear() === year && o.paymentStatus === 'Paid';
            });
            const revenue = mOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

            // Projects this month
            const mProjects = allProjects.filter(p => {
                const pd = new Date(p.date || Date.now());
                return pd.getMonth() === month && pd.getFullYear() === year;
            });

            monthlyData.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                revenue,
                orders: mOrders.length,
                projects: mProjects.length
            });
        }

        // Growth Rate for projects (vs last month)
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const currMonthProjects = allProjects.filter(p => {
            const pd = new Date(p.date || Date.now());
            return pd.getMonth() === currentMonth && pd.getFullYear() === currentYear;
        }).length;
        const prevMonthProjects = allProjects.filter(p => {
            const pd = new Date(p.date || Date.now());
            return pd.getMonth() === prevMonth && pd.getFullYear() === prevMonthYear;
        }).length;
        
        const projectGrowth = prevMonthProjects > 0
            ? ((currMonthProjects - prevMonthProjects) / prevMonthProjects * 100).toFixed(1)
            : 0;

        return {
            totalRevenue,
            totalOrders,
            totalProjects,
            totalUsers,
            generatedAssets,
            projectGrowth,
            avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
            monthlyData,
            recentOrders: orders.slice(-5).reverse()
        };
    }, [orders, allProjects, users, timeRange, startDate, endDate]);

    const MetricCard = ({ icon, label, value, subtext, trend, iconColor }) => (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon name={icon} size={24} className="text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                        <Icon name={trend >= 0 ? "ArrowUp" : "ArrowDown"} size={12} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-gray-400">{label}</p>
            {subtext && <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">{subtext}</p>}
        </div>
    );

    const maxRevenue = Math.max(...metrics.monthlyData.map(d => d.revenue), 1);

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Business Analytics
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">
                        Track your revenue, orders, and business growth
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {['all', 'year', 'month'].map(range => (
                        <button
                            key={range}
                            onClick={() => {
                                setTimeRange(range);
                                setShowDatePicker(false);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === range
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {range === 'all' ? 'All Time' : range === 'year' ? 'This Year' : 'This Month'}
                        </button>
                    ))}

                    {/* Custom Date Range */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${timeRange === 'custom'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                        >
                            <Icon name="Calendar" size={16} />
                            Custom Range
                        </button>

                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-xl z-50 min-w-[300px]">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (startDate && endDate) {
                                                setTimeRange('custom');
                                                setShowDatePicker(false);
                                            }
                                        }}
                                        disabled={!startDate || !endDate}
                                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    icon="DollarSign"
                    label="Total Revenue"
                    value={`$${metrics.totalRevenue.toFixed(2)}`}
                    subtext={`${metrics.totalOrders} paid orders`}
                    iconColor="from-green-500 to-emerald-600"
                />
                <MetricCard
                    icon="Sparkles"
                    label="Generated Assets"
                    value={metrics.generatedAssets}
                    subtext="3D Models & Textures"
                    iconColor="from-blue-500 to-cyan-600"
                />
                <MetricCard
                    icon="Layers"
                    label="Total Projects"
                    value={metrics.totalProjects}
                    subtext="All active workflows"
                    trend={parseFloat(metrics.projectGrowth)}
                    iconColor="from-purple-500 to-pink-600"
                />
                <MetricCard
                    icon="Users"
                    label="Total Users"
                    value={metrics.totalUsers}
                    subtext="Registered accounts"
                    iconColor="from-orange-500 to-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Trend Graph */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Icon name="BarChart2" className="text-emerald-500" />
                        Revenue Trend
                    </h3>

                    {metrics.monthlyData.some(d => d.revenue > 0) ? (
                        <div className="h-48 flex items-end justify-between gap-2">
                            {metrics.monthlyData.map((data, i) => {
                                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full h-full flex items-end">
                                            {data.revenue > 0 ? (
                                                <div
                                                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-600 rounded-t-lg transition-all duration-500 hover:scale-x-110 cursor-pointer relative"
                                                    style={{ height: `${Math.max(height, 5)}%` }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 font-bold">
                                                        ${data.revenue.toFixed(0)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded"></div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">{data.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                            <Icon name="BarChart2" size={32} className="mb-2 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No Sales Data</p>
                        </div>
                    )}
                </div>

                {/* Project Activity Graph */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Icon name="Activity" className="text-purple-500" />
                        Project Activity
                    </h3>

                    {metrics.monthlyData.some(d => d.projects > 0) ? (
                        <div className="h-48 flex items-end justify-between gap-2">
                            {metrics.monthlyData.map((data, i) => {
                                const maxProjects = Math.max(...metrics.monthlyData.map(d => d.projects), 1);
                                const height = (data.projects / maxProjects) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full h-full flex items-end">
                                            {data.projects > 0 ? (
                                                <div
                                                    className="w-full bg-gradient-to-t from-purple-500 to-pink-600 rounded-t-lg transition-all duration-500 hover:scale-x-110 cursor-pointer relative"
                                                    style={{ height: `${Math.max(height, 5)}%` }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 font-bold">
                                                        {data.projects} Projects
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded"></div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">{data.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                            <Icon name="Activity" size={32} className="mb-2 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No Project Data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Icon name="File" className="text-blue-600" />
                    Recent Transactions
                </h3>
                <div className="space-y-3">
                    {metrics.recentOrders.length > 0 ? (
                        metrics.recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl hover:bg-slate-100 dark:hover:bg-black/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {order.brandName?.[0] || 'B'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{order.brandName || 'Brand'}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-green-600 dark:text-green-400">${order.amount?.toFixed(2) || '0.00'}</p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">{order.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400 dark:text-gray-500">
                            <Icon name="File" size={48} className="mx-auto mb-2 opacity-20" />
                            <p>No completed transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
