import { useState, useEffect } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { BASE_URL } from '../../services/api';

export const OrdersView = () => {
    const { orders, updateOrderStatus, markNotificationsAsRead, deleteOrder, createProject, setCurrentView, addOrderComment } = useGlobal();
    const navigate = useNavigate();
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [estimatedDate, setEstimatedDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateSort, setDateSort] = useState('newest'); // 'newest' | 'oldest'

    // Deliverable State
    const [showDeliverableModal, setShowDeliverableModal] = useState(false);
    const [deliverableFile, setDeliverableFile] = useState(null);
    const [deliverableNote, setDeliverableNote] = useState('');

    const handleOpenDeliverableModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowDeliverableModal(true);
        setDeliverableFile(null);
        setDeliverableNote('');
    };

    const handleUploadDeliverable = (e) => {
        e.preventDefault();
        if (selectedOrderId && deliverableFile) {
            // In a real app, this would upload to S3/Storage
            // Here we simulate by creating a fake URL or using the name
            const fakeUrl = URL.createObjectURL(deliverableFile);

            const newDeliverable = {
                name: deliverableFile.name,
                url: fakeUrl, // Temporary blob URL for demo
                type: deliverableFile.type,
                note: deliverableNote,
                date: new Date().toISOString()
            };

            const order = orders.find(o => o.id === selectedOrderId);
            const currentDeliverables = order.deliverables || [];

            updateOrderStatus(selectedOrderId, 'Delivered', {
                orderStatus: 'Delivered',
                deliverables: [...currentDeliverables, newDeliverable]
            });

            setShowDeliverableModal(false);
            setSelectedOrderId(null);
            setDeliverableFile(null);
        }
    };

    const handleOpenAcceptModal = (orderId, currentDate = null) => {
        setSelectedOrderId(orderId);
        setEstimatedDate(currentDate || new Date().toISOString().split('T')[0]);
        setIsEditing(!!currentDate);
        setShowAcceptModal(true);
    };

    const handleConfirmAccept = () => {
        if (selectedOrderId && estimatedDate) {
            updateOrderStatus(selectedOrderId, 'Accepted', {
                estimatedCompletionDate: estimatedDate,
                orderStatus: 'Accepted',
                paymentStatus: 'Unpaid' // Keep as unpaid until customer pays
            });
            setShowAcceptModal(false);
            setSelectedOrderId(null);
            setEstimatedDate('');
            setIsEditing(false);
        }
    };

    const handleStartProject = (order) => {
        createProject({
            id: `PRJ-${order.id.replace('ORD-', '')}`,
            title: `${order.brandName || 'Brand'} Collection`,
            company: order.brandName || 'Brand',
            shirtDesc: order.modelDescription || '',
            modelDesc: order.referenceHeight ? `Height: ${order.referenceHeight}cm` : '',
            files: {
                shirt: order.shirtImage,
                model: order.referenceImage
            }
        });
        navigate('/home');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Pending Approval': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'Accepted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Completed':
            case 'Delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Unpaid': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        // Status Filter
        const currentStatus = order.orderStatus || order.status;
        const matchesStatus = statusFilter === 'All'
            ? true
            : statusFilter === 'Pending'
                ? (currentStatus === 'Pending' || currentStatus === 'Pending Approval')
                : currentStatus === statusFilter;

        // Search Filter (Company/Brand Name)
        const brandName = (order.brandName || '').toLowerCase();
        const matchesSearch = brandName.includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    }).sort((a, b) => {
        // Date Sort
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Order Management
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">
                        Manage incoming requests from Brand Portal
                    </p>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-gray-300 whitespace-nowrap">
                    Total: {filteredOrders.length} <span className="text-slate-400 font-normal">/ {orders.length}</span>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center">
                {/* Status Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl overflow-x-auto w-full xl:w-auto no-scrollbar">
                    {['All', 'Pending', 'Accepted', 'Rejected', 'Completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${statusFilter === status
                                ? 'bg-white dark:bg-cyan-500/20 text-slate-900 dark:text-cyan-400 shadow-sm'
                                : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 xl:w-64">
                        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                        />
                    </div>

                    {/* Date Sort */}
                    <button
                        onClick={() => setDateSort(dateSort === 'newest' ? 'oldest' : 'newest')}
                        className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-gray-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Icon name={dateSort === 'newest' ? 'ArrowDown' : 'ArrowUp'} size={16} />
                        {dateSort === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-gray-500">
                            <Icon name="Search" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-gray-300">No Orders Found</h3>
                        <p className="text-slate-500 dark:text-gray-500">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Unread Indicator */}
                            {order.read === false && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            )}

                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Images Container */}
                                <div className="flex gap-4">
                                    {/* Shirt Image */}
                                    <div className="w-48 h-48 bg-slate-100 dark:bg-black/40 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 relative group">
                                        {order.shirtImage ? (
                                            <>
                                                <img src={order.shirtImage?.startsWith('http') ? order.shirtImage : `${BASE_URL}${order.shirtImage}`} alt="Garment Asset" className="w-full h-full object-contain" />
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                                                    Garment
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a
                                                        href={order.shirtImage?.startsWith('http') ? order.shirtImage : `${BASE_URL}${order.shirtImage}`}
                                                        download={`order-${order.id}-garment.png`}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                                        title="Download Garment"
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

                                    {/* Reference Image (If Exists) */}
                                    {order.referenceImage && (
                                        <div className="w-48 shrink-0">
                                            <div className="w-48 h-48 bg-slate-100 dark:bg-black/40 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 relative group">
                                                <img src={order.referenceImage?.startsWith('http') ? order.referenceImage : `${BASE_URL}${order.referenceImage}`} alt="Reference" className="w-full h-full object-contain" />
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/80 rounded text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                                                    Reference
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a
                                                        href={order.referenceImage?.startsWith('http') ? order.referenceImage : `${BASE_URL}${order.referenceImage}`}
                                                        download={`order-${order.id}-reference.png`}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                                        title="Download Reference"
                                                    >
                                                        <Icon name="Download" size={20} />
                                                    </a>
                                                </div>
                                            </div>
                                            {/* Height Display */}
                                            {order.referenceHeight && (
                                                <div className="mt-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Icon name="User" size={12} className="text-blue-400" />
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">Height:</span>
                                                        <span className="font-mono text-slate-700 dark:text-gray-300">{order.referenceHeight} cm</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Order Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-mono text-xs text-slate-400 dark:text-gray-500">#{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus || order.status)}`}>
                                                    {order.orderStatus || order.status}
                                                </span>
                                                {order.paymentStatus && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        💳 {order.paymentStatus}
                                                    </span>
                                                )}
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
                                                {order.status === 'Accepted' && order.estimatedCompletionDate && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1 text-blue-400">
                                                            <Icon name="Calendar" size={12} />
                                                            Est: {order.estimatedCompletionDate}
                                                        </span>
                                                        <button
                                                            onClick={() => handleOpenAcceptModal(order.id, order.estimatedCompletionDate)}
                                                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                                                            title="Edit Date"
                                                        >
                                                            <Icon name="Edit" size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                                {order.status === 'Completed' && (
                                                    <span className="flex items-center gap-1 text-green-500">
                                                        <Icon name="CheckCircle" size={12} />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-wrap">
                                            {/* Pending Approval Orders - Admin can Accept/Reject */}
                                            {(order.orderStatus === 'Pending Approval' || order.status === 'Pending') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenAcceptModal(order.id)}
                                                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="CheckCircle" size={14} /> Accept Order
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'Rejected', { orderStatus: 'Rejected' })}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="X" size={14} /> Reject
                                                    </button>
                                                </>
                                            )}

                                            {/* Accepted Orders - Can mark as Complete when paid */}
                                            {(order.orderStatus === 'Accepted' || order.status === 'Accepted') && order.paymentStatus === 'Paid' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'Completed', { orderStatus: 'Completed' })}
                                                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Icon name="CheckCircle" size={14} /> Mark Complete
                                                </button>
                                            )}

                                            {/* Workflow Automation: Start Project from Accepted Order */}
                                            {(order.orderStatus === 'Accepted' || order.status === 'Accepted') && (
                                                <>
                                                    <button
                                                        onClick={() => handleStartProject(order)}
                                                        className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="Play" size={14} /> Start Project
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDeliverableModal(order.id)}
                                                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="UploadCloud" size={14} /> Deliverable
                                                    </button>
                                                </>
                                            )}

                                            {/* Accepted but Unpaid - Show payment pending */}
                                            {(order.orderStatus === 'Accepted' || order.status === 'Accepted') && order.paymentStatus === 'Unpaid' && (
                                                <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    <Icon name="AlertCircle" size={14} /> Awaiting Payment
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => updateOrderStatus(order.id, 'Delivered', { orderStatus: 'Delivered' })}
                                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                            >
                                                <Icon name="Send" size={14} /> Send
                                            </button>
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                            >
                                                <Icon name="Trash" size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                        <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {order.modelDescription}
                                        </p>
                                        {/* Comments Section */}
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                            <h4 className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">Comments</h4>

                                            {/* Comment List */}
                                            {order.comments && order.comments.length > 0 ? (
                                                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {order.comments.map((comment) => (
                                                        <div key={comment.id} className={`flex gap-3 ${comment.author === 'Admin' ? 'flex-row-reverse' : ''}`}>
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${comment.author === 'Admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                                {comment.author === 'Admin' ? 'A' : 'C'}
                                                            </div>
                                                            <div className={`p-2 rounded-xl text-xs max-w-[80%] ${comment.author === 'Admin'
                                                                ? 'bg-purple-500 text-white rounded-tr-none'
                                                                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 rounded-tl-none'}`}>
                                                                <p>{comment.text}</p>
                                                                <p className={`text-[10px] mt-1 ${comment.author === 'Admin' ? 'text-purple-200' : 'text-slate-400 dark:text-gray-500'}`}>
                                                                    {new Date(comment.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 dark:text-gray-600 italic mb-4">No comments yet.</p>
                                            )}

                                            {/* Add Comment */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type a message..."
                                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            addOrderComment(order.id, { text: e.target.value, author: 'Admin' });
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling;
                                                        if (input.value.trim()) {
                                                            addOrderComment(order.id, { text: input.value, author: 'Admin' });
                                                            input.value = '';
                                                        }
                                                    }}
                                                >
                                                    <Icon name="Send" size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


            {/* Accept Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>

                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Icon name="CheckCircle" className="text-blue-500" />
                            {isEditing ? 'Update Estimate' : 'Accept Project'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {isEditing
                                ? 'Update the estimated completion date for this project.'
                                : 'Please select the Estimated Completion Date to inform the client.'}
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Est. Completion Date</label>
                            <input
                                type="date"
                                value={estimatedDate}
                                onChange={(e) => setEstimatedDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAccept}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                {isEditing ? 'Update Date' : 'Accept & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deliverable Upload Modal */}
            {showDeliverableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Icon name="UploadCloud" className="text-purple-500" />
                            Upload Deliverable
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Upload final files for the client (GLB, MP4, PNG).
                        </p>

                        <form onSubmit={handleUploadDeliverable} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select File</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setDeliverableFile(e.target.files[0])}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note (Optional)</label>
                                <textarea
                                    value={deliverableNote}
                                    onChange={(e) => setDeliverableNote(e.target.value)}
                                    placeholder="Add a message for the client..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500 h-24 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDeliverableModal(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!deliverableFile}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                >
                                    Upload & Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};
