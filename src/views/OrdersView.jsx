import { useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const OrdersView = () => {
    const { orders, updateOrderStatus, markNotificationsAsRead } = useGlobal();

    useEffect(() => {
        markNotificationsAsRead();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Accepted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Order Management
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">
                        Manage incoming requests from Brand Portal
                    </p>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-gray-300">
                    Total Orders: {orders.length}
                </div>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-gray-500">
                            <Icon name="Clipboard" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-gray-300">No Orders Yet</h3>
                        <p className="text-slate-500 dark:text-gray-500">Requests from the Brand Portal will appear here.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Unread Indicator */}
                            {order.read === false && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            )}

                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Image Thumbnail */}
                                <div className="w-full lg:w-48 h-48 bg-slate-100 dark:bg-black/40 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 relative group">
                                    {order.shirtImage ? (
                                        <>
                                            <img src={order.shirtImage} alt="Order Asset" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <a
                                                    href={order.shirtImage}
                                                    download={`order-${order.id}-asset.png`}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                                    title="Download Asset"
                                                >
                                                    <Icon name="Download" size={20} />
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-600">
                                            <Icon name="Shirt" size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Order Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-xs text-slate-400 dark:text-gray-500">#{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                {order.brandName || 'Brand'} Request
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
                                                <span>{new Date(order.date).toLocaleString()}</span>
                                                {order.brandEmail && (
                                                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                                                        <Icon name="Mail" size={12} />
                                                        {order.brandEmail}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'Accepted')}
                                                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="CheckCircle" size={14} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="X" size={14} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'Accepted' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                                                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Icon name="CheckCircle" size={14} /> Mark Complete
                                                </button>
                                            )}

                                            <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                                                <Icon name="Send" size={14} /> Send
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                        <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {order.modelDescription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
