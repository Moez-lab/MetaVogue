import { useState, useMemo, memo } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';

// ── Components ───────────────────────────────────────────────────────

const StatsCard = memo(({ label, value, trend, icon, color }) => (
    <div className="glass-premium p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[160px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 glass-premium text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                <Icon name={icon} size={20} />
            </div>
        </div>
        
        <div className="mt-2">
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{value}</h3>
        </div>

        <div className="flex items-center gap-2 mt-4">
            {trend !== undefined ? (
                <>
                    <span className={`flex items-center gap-0.5 text-xs font-black ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        <Icon name={trend >= 0 ? "ArrowUp" : "ArrowDown"} size={10} />
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tighter">since last month</span>
                </>
            ) : (
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest opacity-60">Real-time data</span>
            )}
        </div>
        
        {/* Subtle glow based on color */}
        <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-10 ${color.replace('bg-', 'bg-')} group-hover:opacity-20 transition-opacity`}></div>
    </div>
));

const FinanceCard = memo(({ label, value, progress, icon, color }) => (
    <div className="glass-premium p-6 rounded-[2rem] flex items-center justify-between group h-full">
        <div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10 ${color} text-white`}>
                <Icon name={icon} size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase tracking-widest">{label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Current Financial Year</p>
        </div>
        <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - progress / 100)} className={`${color.includes('emerald') ? 'text-emerald-500' : 'text-purple-500'} transition-all duration-1000`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white">+{progress}%</div>
        </div>
    </div>
));

const DonutChart = memo(({ label, items }) => (
    <div className="glass-premium p-6 rounded-[2rem] flex flex-col items-center h-full">
        <div className="w-full flex justify-between items-center mb-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{label}</h4>
            <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/10">
                <Icon name="MoreVertical" size={14} className="text-slate-500" />
            </div>
        </div>
        <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-white/5" />
                {items.map((item, i) => {
                    const total = items.reduce((s, it) => s + it.value, 0) || 1;
                    const offset = items.slice(0, i).reduce((sum, it) => sum + (it.value / total) * 377, 0);
                    return <circle key={i} cx="80" cy="80" r="60" stroke={item.color} strokeWidth="20" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (item.value / total) * 377} style={{ transform: `rotate(${(offset / 377) * 360}deg)`, transformOrigin: '80px 80px' }} className="transition-all duration-1000" />;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{items[0]?.count || items[0]?.value || 0}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1 text-center leading-none">Status<br/>Report</p>
            </div>
        </div>
        <div className="w-full space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-500 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white">{item.value}%</span>
                </div>
            ))}
        </div>
    </div>
));

const WorkflowCard = memo(({ project, onCancel, onNew, onStepClick }) => (
    <div className="glass-premium p-6 rounded-[2rem] border-cyan-500/20">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Workflow</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Orchestrate mission session</p>
            </div>
            <div className="flex gap-2">
                <button onClick={onNew} className="p-2 glass-premium text-cyan-400 rounded-xl hover:scale-105 transition-all"><Icon name="Plus" size={16} /></button>
                <button onClick={onCancel} className="p-2 glass-premium text-red-500 rounded-xl hover:scale-105 transition-all"><Icon name="X" size={16} /></button>
            </div>
        </div>

        {project ? (
            <div className="space-y-4">
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center gap-3 group cursor-pointer hover:bg-cyan-500/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform"><Icon name="Layers" size={20} /></div>
                    <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{project.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{project.id}</p>
                    </div>
                </div>
                {[
                    { step: '02', label: '3D Model', icon: 'Cube', key: 'model', view: 'model' },
                    { step: '03', label: 'Texture', icon: 'Cpu', key: 'texture', view: 'texture' },
                    { step: '04', label: 'Garment', icon: 'Upload', key: 'garment', view: 'upload' }
                ].map((s, i) => {
                    const isDone = project.steps?.[s.key] === 'done';
                    const isPrevDone = i === 0 ? true : project.steps?.[['model', 'texture'][i-1]] === 'done';
                    const isActive = !isDone && isPrevDone;

                    return (
                        <div key={s.step} 
                            onClick={isActive || isDone ? () => onStepClick(s.view) : null}
                            className={`p-4 rounded-2xl flex items-center justify-between transition-all group cursor-pointer 
                            ${isDone ? 'bg-emerald-500/5 border border-emerald-500/20' : isActive ? 'bg-cyan-500/10 border border-cyan-400/30 shadow-lg shadow-cyan-500/5' : 'bg-white/5 border border-white/5 opacity-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-cyan-500 text-white animate-pulse' : 'bg-white/10 text-slate-500'}`}>
                                    {isDone ? <Icon name="Check" size={14}/> : s.step}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${isActive ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>{s.label}</p>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">{isDone ? 'Complete' : isActive ? 'Ready to Start' : 'Pending'}</p>
                                </div>
                            </div>
                            <button className={`p-2 rounded-lg ${isActive ? 'bg-cyan-500 text-white' : 'text-slate-500 group-hover:bg-white/10'}`}>
                                <Icon name={isDone ? "Check" : "ChevronRight"} size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Icon name="Target" size={32} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-bold">No active mission</p>
                <button onClick={onNew} className="px-8 py-3 bg-cyan-500 text-black font-black rounded-2xl shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Initialize Project</button>
            </div>
        )}
    </div>
));

// ── Main View ────────────────────────────────────────────────────────

export const HomeView = () => {
    const { setCurrentView, activeProject, allProjects, createProject, cancelProject, user, orders, updateOrderStatus, users } = useGlobal();
    
    // Filtering States
    const [timeFilter, setTimeFilter] = useState('all'); // all, year, month, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [newProjectData, setNewProjectData] = useState({ title: '', company: '', description: '' });

    // Computed Filtered Data
    const trends = useMemo(() => {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const getMetricForRange = (start, end) => {
            const rangeOrders = orders.filter(o => {
                const d = new Date(o.date);
                return d >= start && d <= end;
            });
            const rangeProjects = (allProjects || []).filter(p => {
                const d = new Date(p.date || Date.now());
                return d >= start && d <= end;
            });

            const revenue = rangeOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.amount || 0), 0);
            const assets = rangeProjects.reduce((sum, p) => sum + Object.values(p.steps || {}).filter(s => s === 'done').length, 0);
            
            return { revenue, assets, projects: rangeProjects.length };
        };

        const current = getMetricForRange(startOfCurrentMonth, now);
        const prev = getMetricForRange(startOfPrevMonth, endOfPrevMonth);

        const calc = (cur, old) => {
            if (old === 0) return cur > 0 ? 100 : 0;
            return Math.round(((cur - old) / old) * 100 * 10) / 10;
        };

        return {
            revenue: calc(current.revenue, prev.revenue),
            assets: calc(current.assets, prev.assets),
            projects: calc(current.projects, prev.projects),
            users: (users || []).length > 2 ? 4.2 : 0 // Users usually just grow
        };
    }, [orders, allProjects, users]);

    const filteredMetrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let fOrders = [...orders];
        let fProjects = [...(allProjects || [])];

        if (timeFilter === 'month') {
            fOrders = fOrders.filter(o => {
                const d = new Date(o.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            fProjects = fProjects.filter(p => {
                const d = new Date(p.date || Date.now());
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
        } else if (timeFilter === 'year') {
            fOrders = fOrders.filter(o => new Date(o.date).getFullYear() === currentYear);
            fProjects = fProjects.filter(p => new Date(p.date || Date.now()).getFullYear() === currentYear);
        } else if (timeFilter === 'custom' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            fOrders = fOrders.filter(o => {
                const d = new Date(o.date);
                return d >= start && d <= end;
            });
            fProjects = fProjects.filter(p => {
                const d = new Date(p.date || Date.now());
                return d >= start && d <= end;
            });
        }

        const paidOrders = fOrders.filter(o => o.paymentStatus === 'Paid');
        const revenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        
        const assets = fProjects.reduce((sum, p) => {
            const stepsDone = Object.values(p.steps || {}).filter(s => s === 'done').length;
            return sum + stepsDone;
        }, 0);

        return {
            revenue,
            paidCount: paidOrders.length,
            assets,
            projects: fProjects.length,
            users: (users || []).filter(u => !u.isAdmin).length, 
            orders: fOrders,
            allProjects: fProjects
        };
    }, [orders, allProjects, users, timeFilter, startDate, endDate]);

    // Graph Data based on filtered metrics
    const chartData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const m = date.getMonth();
            const y = date.getFullYear();
            
            const mOrders = orders.filter(o => {
                const od = new Date(o.date);
                return od.getMonth() === m && od.getFullYear() === y && o.paymentStatus === 'Paid';
            });

            // If filter is year, only show current year months effectively (optional style)
            // But usually graphs show a rolling history
            monthlyData.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                revenue: mOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
                count: mOrders.length
            });
        }
        return monthlyData;
    }, [orders]);

    const handleCreateProject = (e) => {
        e.preventDefault();
        const id = `PRJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        createProject({ id, date: new Date().toISOString(), ...newProjectData });
        setShowProjectModal(false);
        setNewProjectData({ title: '', company: '', description: '' });
    };

    const updateOrderStatusLocal = (id, status, updates) => {
        updateOrderStatus(id, status, updates);
    };

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
    const unpaidOrders = orders.filter(o => o.brandEmail === user?.email && o.paymentStatus === 'Unpaid' && (o.status === 'Accepted' || o.orderStatus === 'Accepted'));

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in no-scrollbar pb-20">
            {/* Functional Header with Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Analytics</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {['all', 'year', 'month'].map(range => (
                        <button
                            key={range}
                            onClick={() => { setTimeFilter(range); setShowDatePicker(false); }}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300
                            ${timeFilter === range 
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105' 
                                : 'glass-premium text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {range === 'all' ? 'All Time' : range === 'year' ? 'This Year' : 'This Month'}
                        </button>
                    ))}
                    
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2
                            ${timeFilter === 'custom' 
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
                                : 'glass-premium text-slate-400 hover:text-white'}`}
                        >
                            <Icon name="Calendar" size={14} />
                            Custom Range
                        </button>

                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-4 glass-premium p-6 rounded-[2rem] z-50 min-w-[320px] shadow-2xl animate-fade-in border-white/10">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Start Date</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full glass-premium bg-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">End Date</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full glass-premium bg-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" />
                                    </div>
                                    <button
                                        onClick={() => { if(startDate && endDate) { setTimeFilter('custom'); setShowDatePicker(false); } }}
                                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    label="Total Revenue" 
                    value={`$${filteredMetrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                    trend={trends.revenue}
                    icon="DollarSign" 
                    color="bg-emerald-500" 
                />
                <StatsCard 
                    label="Generated Assets" 
                    value={filteredMetrics.assets} 
                    trend={trends.assets}
                    icon="Sparkles" 
                    color="bg-blue-500" 
                />
                <StatsCard 
                    label="Total Projects" 
                    value={filteredMetrics.projects} 
                    trend={trends.projects}
                    icon="Layers" 
                    color="bg-indigo-600" 
                />
                <StatsCard 
                    label="Total Users" 
                    value={filteredMetrics.users} 
                    trend={trends.users}
                    icon="Users" 
                    color="bg-orange-600" 
                />
            </div>

            {/* Middle Big Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Dynamics (Bar Chart) - Now reflects filtered total context if needed */}
                <div className="lg:col-span-2 glass-premium p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sales dynamics</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider opacity-60">Revenue trend analysis</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                        </div>
                    </div>
                    <div className="h-72 flex items-end justify-between gap-3 px-2">
                        {chartData.map((d, i) => {
                            const val = (d.revenue / maxRevenue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group/item cursor-pointer">
                                    <div className="relative w-full h-56 flex items-end justify-center px-1">
                                        {/* Background Track */}
                                        <div className="absolute top-0 w-full h-full bg-white/[0.03] rounded-2xl group-hover/item:bg-white/[0.06] transition-colors"></div>
                                        {/* Value Bar */}
                                        <div 
                                            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-2xl transition-all duration-1000 group-hover/item:scale-x-105 group-hover/item:from-cyan-400 group-hover/item:to-cyan-300 relative z-10 shadow-lg shadow-cyan-500/10"
                                            style={{ height: `${Math.max(val, 5)}%` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[10px] p-2 px-3 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity font-black whitespace-nowrap z-50 shadow-2xl">
                                                ${d.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase mt-6 tracking-tighter group-hover/item:text-slate-300 transition-colors">{d.month}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Grid Lines subtle */}
                    <div className="absolute top-[40%] left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                    <div className="absolute top-[60%] left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                </div>

                {/* Project Status Donut - Reflects Filtered Projects */}
                <DonutChart 
                    label="Project Health" 
                    items={useMemo(() => {
                        const total = filteredMetrics.projects || 1;
                        const completed = filteredMetrics.allProjects.filter(p => 
                            p.steps.model === 'done' && p.steps.texture === 'done' && p.steps.garment === 'done'
                        ).length;
                        const inProgress = filteredMetrics.allProjects.filter(p => 
                            Object.values(p.steps).some(s => s === 'done') && 
                            !Object.values(p.steps).every(s => s === 'done')
                        ).length;
                        const planning = Math.max(0, filteredMetrics.projects - completed - inProgress);

                        return [
                            { name: 'Completed', value: Math.round((completed / total) * 100), count: completed, color: '#22d3ee' },
                            { name: 'In Progress', value: Math.round((inProgress / total) * 100), count: inProgress, color: '#fbbf24' },
                            { name: 'Planning', value: Math.round((planning / total) * 100), count: planning, color: '#475569' } // Slate-600 instead of red/pink
                        ];
                    }, [filteredMetrics.projects, filteredMetrics.allProjects])} 
                />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions / Customer Table */}
                <div className="lg:col-span-2 glass-premium p-8 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Customer order</h3>
                        <div className="flex gap-2">
                             <span className="px-4 py-1.5 glass-premium rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</span>
                             <Icon name="RefreshCcw" className="text-slate-500 cursor-pointer hover:rotate-180 transition-all duration-1000 p-1.5" size={32} />
                        </div>
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="pb-6 px-4">Profile</th>
                                    <th className="pb-6 px-4">Identifier</th>
                                    <th className="pb-6 px-4">Date</th>
                                    <th className="pb-6 px-4">Status</th>
                                    <th className="pb-6 px-4 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {[...filteredMetrics.orders].reverse().slice(0, 6).map((order) => (
                                    <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 text-xs font-black border border-cyan-500/10 group-hover:scale-110 transition-transform">{order.brandName?.[0] || 'B'}</div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white">{order.brandName || 'MetaVogue'}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-xs font-bold text-slate-500">{order.id}</td>
                                        <td className="py-5 px-4 text-xs font-black text-yellow-500/80">{new Date(order.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                        <td className="py-5 px-4">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter ${order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'}`}>
                                                {order.paymentStatus === 'Paid' ? 'Delivered' : 'Processing'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-right text-sm font-black text-white/90 group-hover:text-cyan-400 transition-colors">${order.amount?.toLocaleString() || '920'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredMetrics.orders.length === 0 && (
                            <div className="py-20 text-center">
                                <Icon name="Inbox" size={48} className="text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No orders found for this period</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Cards Column */}
                <div className="space-y-8">
                    {/* Finance Cards Row */}
                    <div className="grid grid-cols-1 gap-8">
                         <FinanceCard label="Paid Invoices" value={`$${filteredMetrics.revenue.toLocaleString()}`} progress={filteredMetrics.revenue > 0 ? 15 : 0} icon="FileText" color="bg-purple-500/20 text-purple-400" />
                         <FinanceCard label="Funds received" value={`$${(filteredMetrics.revenue * 1.5).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} progress={filteredMetrics.revenue > 0 ? 59 : 0} icon="DollarSign" color="bg-emerald-500/20 text-emerald-400" />
                    </div>
                    
                    {/* Workflow Section Re-integrated */}
                    <WorkflowCard 
                        project={activeProject} 
                        onNew={() => setShowProjectModal(true)} 
                        onCancel={cancelProject} 
                        onStepClick={(view) => setCurrentView(view)} 
                    />
                </div>
            </div>

            {/* Modals */}
            {showProjectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="glass-premium w-full max-w-md rounded-[3rem] p-10 relative animate-fade-in border-cyan-500/30 shadow-2xl">
                        <button onClick={() => setShowProjectModal(false)} className="absolute right-8 top-8 p-2 hover:bg-white/10 rounded-2xl transition-colors">
                            <Icon name="X" size={24} className="text-slate-500" />
                        </button>
                        <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
                            <Icon name="Sparkles" size={32} className="text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">New Mission</h3>
                        <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest font-black opacity-80">Initialize production workflow</p>
                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Collection Title</label>
                                <input type="text" required value={newProjectData.title} onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })} className="w-full glass-premium bg-white/5 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-700" placeholder="e.g. Cyber Streetwear" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Entity</label>
                                <input type="text" required value={newProjectData.company} onChange={e => setNewProjectData({ ...newProjectData, company: e.target.value })} className="w-full glass-premium bg-white/5 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-slate-700" placeholder="e.g. MetaVogue Corp" />
                            </div>
                            <button type="submit" className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-3xl shadow-2xl shadow-cyan-500/40 transition-all uppercase tracking-widest text-sm mt-4 hover:scale-[1.02] active:scale-95">Deploy Production</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="glass-premium w-full max-w-md rounded-[3rem] p-10 relative animate-fade-in border-yellow-500/30 shadow-2xl">
                         <button onClick={() => setShowPaymentModal(false)} className="absolute right-8 top-8 p-2 hover:bg-white/10 rounded-2xl transition-colors">
                            <Icon name="X" size={24} className="text-slate-500" />
                        </button>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Complete Payment</h3>
                        <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest font-black">Order #{selectedOrder.id}</p>
                        <form onSubmit={handlePaymentSubmit} className="space-y-5">
                             <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl mb-4">
                                <p className="text-xs font-black text-yellow-500 uppercase tracking-widest">Amount Due</p>
                                <p className="text-3xl font-black text-white tracking-tighter">${selectedOrder.amount?.toLocaleString()}</p>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Card Number</label>
                                 <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full glass-premium bg-white/5 rounded-2xl p-4 text-white outline-none focus:border-yellow-500 transition-all font-bold placeholder:text-slate-700" placeholder="0000 0000 0000 0000" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry</label>
                                      <input type="text" required value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full glass-premium bg-white/5 rounded-2xl p-4 text-white outline-none focus:border-yellow-500 transition-all font-bold" placeholder="MM/YY" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CVC</label>
                                      <input type="text" required value={cvc} onChange={e => setCvc(e.target.value)} className="w-full glass-premium bg-white/5 rounded-2xl p-4 text-white outline-none focus:border-yellow-500 transition-all font-bold" placeholder="123" />
                                  </div>
                             </div>
                             <button type="submit" disabled={isProcessingPayment} className="w-full py-5 bg-yellow-500 hover:bg-yellow-600 text-black font-black rounded-3xl shadow-2xl shadow-yellow-500/40 transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-50">
                                 {isProcessingPayment ? 'Securing Transaction...' : 'Pay Invoice Now'}
                             </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
