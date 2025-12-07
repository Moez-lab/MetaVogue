import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const MyOrdersView = () => {
    const { orders, user, updateOrderStatus } = useGlobal();
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Filter orders by current user
    const myOrders = orders.filter(o => o.brandEmail === user?.email);

    // Apply status filter
    const filteredOrders = myOrders.filter(order => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return order.orderStatus === 'Pending Approval' || order.status === 'Pending';
        if (statusFilter === 'approved') return order.orderStatus === 'Accepted' || order.status === 'Accepted';
        if (statusFilter === 'rejected') return order.orderStatus === 'Rejected' || order.status === 'Rejected';
        return true;
    });

    const handlePayNow = (order) => {
        setSelectedOrder(order);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessingPayment(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        updateOrderStatus(selectedOrder.id, selectedOrder.status, {
            paymentStatus: 'Paid',
            paidDate: new Date().toISOString()
        });

        setIsProcessingPayment(false);
        setShowPaymentModal(false);
        setSelectedOrder(null);
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setCardName('');
    };

    const getStatusColor = (order) => {
        const status = order.orderStatus || order.status;
        switch (status) {
            case 'Pending':
            case 'Pending Approval': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'Accepted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
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

    const statusCounts = {
        all: myOrders.length,
        pending: myOrders.filter(o => o.orderStatus === 'Pending Approval' || o.status === 'Pending').length,
        approved: myOrders.filter(o => o.orderStatus === 'Accepted' || o.status === 'Accepted').length,
        rejected: myOrders.filter(o => o.orderStatus === 'Rejected' || o.status === 'Rejected').length
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    My Orders
                </h2>
                <p className="text-slate-500 dark:text-gray-400 mt-1">
                    View and manage your order requests
                </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All Orders', count: statusCounts.all },
                    { key: 'pending', label: 'Pending', count: statusCounts.pending },
                    { key: 'approved', label: 'Approved', count: statusCounts.approved },
                    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusFilter === tab.key
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Order Image */}
                                <div className="w-full md:w-48 shrink-0">
                                    <div className="w-full h-48 bg-slate-100 dark:bg-black/40 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                        {order.shirtImage ? (
                                            <img src={order.shirtImage} alt="Garment" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Icon name="Shirt" size={32} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-mono text-xs text-slate-400 dark:text-gray-500">#{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order)}`}>
                                                    {order.orderStatus || order.status}
                                                </span>
                                                {order.paymentStatus && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        💳 {order.paymentStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                {order.brandName || 'Order'} Request
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
                                                <span>{new Date(order.date).toLocaleDateString()}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">${order.amount?.toFixed(2) || '49.00'}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {(order.orderStatus === 'Accepted' || order.status === 'Accepted') && order.paymentStatus === 'Unpaid' && (
                                                <button
                                                    onClick={() => handlePayNow(order)}
                                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                                                >
                                                    <Icon name="CreditCard" size={16} />
                                                    Pay Now
                                                </button>
                                            )}
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
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10">
                        <Icon name="Box" size={64} className="mx-auto mb-4 text-slate-300 dark:text-gray-600" />
                        <p className="text-slate-500 dark:text-gray-400 text-lg font-bold">No orders found</p>
                        <p className="text-slate-400 dark:text-gray-500 text-sm mt-2">
                            {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'You haven\'t placed any orders yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl relative">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon name="X" size={20} className="text-slate-500" />
                        </button>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Complete Payment</h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-6">Order #{selectedOrder.id}</p>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-600 dark:text-gray-300">
                                <span className="font-bold">Amount Due:</span> ${selectedOrder.amount?.toFixed(2) || '49.00'}
                            </p>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={cardName}
                                    onChange={e => setCardName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    value={cardNumber}
                                    onChange={e => setCardNumber(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Expiry</label>
                                    <input
                                        type="text"
                                        required
                                        value={expiry}
                                        onChange={e => setExpiry(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">CVC</label>
                                    <input
                                        type="text"
                                        required
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="123"
                                        maxLength="4"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessingPayment}
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessingPayment ? 'Processing...' : `Pay $${selectedOrder.amount?.toFixed(2) || '49.00'}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
