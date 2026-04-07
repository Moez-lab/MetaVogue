import { useState } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { useNavigate } from 'react-router-dom';

export const MyTasksView = () => {
    const { user, allProjects, orders, updateOrderStatus } = useGlobal();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'

    // Combine and filter assigned items
    const myProjects = allProjects
        .filter(p => p.assignedAdminEmail === user?.email)
        .map(p => {
            const isCompleted = p.steps?.model === 'done' && p.steps?.texture === 'done' && p.steps?.garment === 'done';
            return {
                ...p,
                type: 'project',
                title: p.company || 'Project',
                isCompleted,
                sortDate: new Date(p.date || Date.now())
            };
        });

    const myOrders = orders
        .filter(o => o.assignedAdminEmail === user?.email)
        .map(o => {
            const currentStatus = o.orderStatus || o.status;
            const isCompleted = currentStatus === 'Completed';
            return {
                ...o,
                type: 'order',
                title: o.brandName ? `${o.brandName} Order` : 'Brand Order',
                isCompleted,
                sortDate: new Date(o.date || Date.now())
            };
        });

    const allMyItems = [...myProjects, ...myOrders].sort((a, b) => b.sortDate - a.sortDate);

    const pendingItems = allMyItems.filter(item => !item.isCompleted);
    const completedItems = allMyItems.filter(item => item.isCompleted);

    const displayItems = activeTab === 'pending' ? pendingItems : completedItems;

    const handleActionClick = (item) => {
        if (item.type === 'order') {
            navigate('/orders');
        } else {
            navigate('/work-tracking');
        }
    };

    const getStatusBadge = (item) => {
        if (item.isCompleted) {
            return (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                    <Icon name="CheckCircle" size={12} /> Completed
                </span>
            );
        }

        if (item.type === 'project') {
            // Count steps done
            const steps = [item.steps?.model, item.steps?.texture, item.steps?.garment];
            const doneCount = steps.filter(s => s === 'done').length;
            return (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    In Progress ({doneCount}/3)
                </span>
            );
        } else {
            // Order pending
            const sts = item.orderStatus || item.status || 'Pending';
            return (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {sts}
                </span>
            );
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in-up flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl text-purple-500">
                            <Icon name="Briefcase" size={24} />
                        </div>
                        My Tasks
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-2">
                        View and manage assignments delegated specifically to you.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`text-sm font-bold pb-4 -mb-px transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
                >
                    <Icon name="Clock" size={16} /> Pending Tasks
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-xs ml-1">{pendingItems.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`text-sm font-bold pb-4 -mb-px transition-colors flex items-center gap-2 ${activeTab === 'completed' ? 'text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-white'}`}
                >
                    <Icon name="CheckCircle" size={16} /> Completed
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-xs ml-1">{completedItems.length}</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {displayItems.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-gray-500">
                            <Icon name="CheckCircle" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-gray-300">All caught up!</h3>
                        <p className="text-slate-500 dark:text-gray-500 mt-2">You don't have any {activeTab} tasks assigned to you right now.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {displayItems.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex flex-col group relative overflow-hidden">
                                
                                {/* Badge overlay for order type */}
                                {item.type === 'order' && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-bl-xl z-10 uppercase">
                                        Customer Order
                                    </div>
                                )}
                                {item.type === 'project' && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-bl-xl z-10 uppercase">
                                        Project
                                    </div>
                                )}

                                <div className="mb-4 pt-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.title}</h3>
                                            <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-1">{item.id}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    {getStatusBadge(item)}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/10 flex gap-2">
                                    <button
                                        onClick={() => handleActionClick(item)}
                                        className="flex-1 py-2 bg-slate-100 dark:bg-white/5 hover:bg-purple-500 hover:text-white text-slate-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all shadow-sm"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
