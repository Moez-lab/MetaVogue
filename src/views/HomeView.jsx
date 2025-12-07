import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const HomeView = () => {
    const { modelImage, shirtImage, setCurrentView, activeProject, createProject, cancelProject, user, orders, updateOrderStatus } = useGlobal();
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [newProjectData, setNewProjectData] = useState({
        title: '',
        company: '',
        description: ''
    });

    const handleCreateProject = (e) => {
        e.preventDefault();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const id = `PRJ-${timestamp}-${random}`;

        createProject({
            id,
            ...newProjectData
        });
        setShowProjectModal(false);
        setNewProjectData({ title: '', company: '', description: '' });
    };

    // Get unpaid accepted orders for current user
    const unpaidOrders = orders.filter(o =>
        o.brandEmail === user?.email &&
        (o.orderStatus === 'Accepted' || o.status === 'Accepted') &&
        o.paymentStatus === 'Unpaid'
    );

    const handlePayNow = (order) => {
        setSelectedOrder(order);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessingPayment(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update order to paid
        updateOrderStatus(selectedOrder.id, selectedOrder.status, {
            paymentStatus: 'Paid',
            paidDate: new Date().toISOString()
        });

        setIsProcessingPayment(false);
        setShowPaymentModal(false);
        setSelectedOrder(null);
        // Reset form
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setCardName('');
    };

    const WorkflowStep = ({ step, title, desc, status, action, onClick }) => (
        <div className={`p-6 rounded-2xl transition-all duration-500 flex items-center gap-5 relative overflow-hidden group border
      ${status === 'done'
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : status === 'current'
                    ? 'bg-cyan-500/10 border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
                    : 'bg-white/60 dark:bg-[#111827]/40 border-slate-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-white/10'
            }`}
        >
            {/* Active Glow Line */}
            {status === 'current' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold relative z-10 shadow-lg transition-transform duration-500 group-hover:scale-110
        ${status === 'done'
                    ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/30'
                    : status === 'current'
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/30'
                        : 'bg-white dark:bg-[#1f2937] text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-white/5'}
      `}>
                {status === 'done' ? <Icon name="CheckCircle" size={20} /> : step}
            </div>

            <div className="flex-1 relative z-10">
                <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${status === 'current' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-white'}`}>
                    {title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-400 transition-colors">{desc}</p>
            </div>

            {status !== 'done' && (
                <button
                    onClick={onClick}
                    className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 relative z-10 overflow-hidden
                    ${status === 'current'
                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    {action || 'Pending'}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen w-full relative bg-white dark:bg-[#050b14] overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-cyan-500/30 transition-colors duration-500">
            {/* Fashion Gradient Background */}
            <div className="hidden dark:block absolute inset-0 fashion-gradient transition-opacity duration-1000"></div>

            {/* Ambient Glows Overlay */}
            <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen"></div>
            <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-12 pb-20">
                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 transition-colors duration-500">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase">
                                v2.4.0 Stable
                            </span>
                            <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                System Online
                            </span>
                        </div>
                        <h2 className="text-7xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">
                            Dashboard
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg max-w-xl leading-relaxed">
                            Orchestrate your digital fashion pipeline with <span className="text-cyan-600 dark:text-cyan-400 font-bold">AI-driven</span> precision.
                        </p>
                    </div>


                </div>

                {/* Payment Notification Banner */}
                {unpaidOrders.length > 0 && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
                                <Icon name="AlertCircle" size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Payment Required
                                </h3>
                                <p className="text-slate-600 dark:text-gray-300 mb-4">
                                    You have {unpaidOrders.length} accepted order{unpaidOrders.length > 1 ? 's' : ''} awaiting payment.
                                </p>
                                <div className="space-y-2">
                                    {unpaidOrders.map(order => (
                                        <div key={order.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                    Order #{order.id}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                                    Amount: ${order.amount?.toFixed(2) || '49.00'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePayNow(order)}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                                            >
                                                <Icon name="CreditCard" size={16} />
                                                Pay Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Workflow Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                                <Icon name="Layers" className="text-cyan-600 dark:text-cyan-400" />
                                Active Workflow
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {activeProject ? (
                                <>
                                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl mb-4 relative group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-cyan-600 dark:text-cyan-400">{activeProject.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{activeProject.company} • {activeProject.id}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Started: {new Date(activeProject.date).toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="px-2 py-1 bg-cyan-500 text-white text-[10px] font-bold rounded-md uppercase">Active</span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setShowProjectModal(true)}
                                                        className="p-1.5 bg-slate-200 dark:bg-white/10 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                                                        title="Start New Project"
                                                    >
                                                        <Icon name="Sparkles" size={14} />
                                                    </button>
                                                    <button
                                                        onClick={cancelProject}
                                                        className="p-1.5 bg-slate-200 dark:bg-white/10 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                                                        title="Cancel Project"
                                                    >
                                                        <Icon name="X" size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <WorkflowStep
                                        step="01"
                                        title="Project Created"
                                        desc="Initial setup complete"
                                        status="done"
                                    />
                                    <WorkflowStep
                                        step="02"
                                        title="Generate 3D Model"
                                        desc="Base mesh generation from prompt"
                                        status={activeProject.steps.model === 'done' ? 'done' : 'current'}
                                        action={activeProject.steps.model === 'done' ? 'View' : 'Start'}
                                        onClick={() => setCurrentView('model')}
                                    />
                                    <WorkflowStep
                                        step="03"
                                        title="Texture Synthesis"
                                        desc="AI-driven fabric mapping"
                                        status={activeProject.steps.model === 'done' ? (activeProject.steps.texture === 'done' ? 'done' : 'current') : 'pending'}
                                        action={activeProject.steps.texture === 'done' ? 'View' : 'Start'}
                                        onClick={() => setCurrentView('texture')}
                                    />
                                    <WorkflowStep
                                        step="04"
                                        title="Upload Garment"
                                        desc="Image to 3D Shirt"
                                        status={activeProject.steps.texture === 'done' ? (activeProject.steps.garment === 'done' ? 'done' : 'current') : 'pending'}
                                        action={activeProject.steps.garment === 'done' ? 'View' : 'Start'}
                                        onClick={() => setCurrentView('upload')}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                                    <p className="text-slate-500 dark:text-slate-400 mb-4">No active project</p>
                                    <button
                                        onClick={() => setShowProjectModal(true)}
                                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all"
                                    >
                                        Create New Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Visuals & Stats */}
                    <div className="space-y-8">
                        {/* Create Project Card (if no active project) */}
                        {!activeProject && (
                            <div
                                onClick={() => setShowProjectModal(true)}
                                className="group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-600/20 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                                            <Icon name="Sparkles" className="text-white" size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">New Project</h3>
                                        <p className="text-sm text-slate-500 dark:text-emerald-200 font-medium">Start a new workflow</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-transparent transition-all duration-300">
                                        <Icon name="ArrowRight" className="text-emerald-500 group-hover:text-white" size={20} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Tracking Card */}
                        <div
                            onClick={() => setCurrentView('work-tracking')}
                            className="group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                                        <Icon name="Clipboard" className="text-white" size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Project Tracker</h3>
                                    <p className="text-sm text-slate-500 dark:text-cyan-200 font-medium">Manage & Track Work</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-transparent transition-all duration-300">
                                    <Icon name="ArrowRight" className="text-cyan-500 group-hover:text-white" size={20} />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                            <Icon name="Activity" className="text-emerald-600 dark:text-emerald-400" />
                            System Visuals
                        </h3>

                        {/* Abstract Hexagon Visual Card */}
                        <div className="h-[450px] relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f18] group transition-colors duration-500">
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20"></div>

                            {/* Glowing Nodes Network */}
                            <div className="absolute inset-0">
                                {/* Connecting Lines (SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                    <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#22d3ee" strokeWidth="1" />
                                    <line x1="50%" y1="50%" x2="80%" y2="40%" stroke="#10b981" strokeWidth="1" />
                                    <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#3b82f6" strokeWidth="1" />
                                </svg>

                                {/* Nodes */}
                                <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse"></div>
                                <div className="absolute top-[40%] right-[20%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute bottom-[20%] left-[50%] w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ animationDelay: '2s' }}></div>

                                {/* Central Hexagon */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center">
                                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-4 border border-emerald-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                                    {/* Core */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl rotate-45 blur-md animate-pulse"></div>
                                    <div className="absolute w-12 h-12 bg-white rounded-xl rotate-45 mix-blend-overlay"></div>
                                </div>
                            </div>

                            {/* Bottom Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#050b14] to-transparent">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mb-1">NODE_STATUS: ACTIVE</p>
                                        <h4 className="text-slate-900 dark:text-white font-bold text-lg">Neural Engine</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">98%</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-500">Efficiency</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Creation Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl relative">
                        <button
                            onClick={() => setShowProjectModal(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon name="X" size={20} className="text-slate-500" />
                        </button>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Start New Project</h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-6">Initialize a new workflow session.</p>

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newProjectData.title}
                                    onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="e.g. Summer Collection"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProjectData.company}
                                    onChange={e => setNewProjectData({ ...newProjectData, company: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="e.g. MetaVogue"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Description (Optional)</label>
                                <textarea
                                    value={newProjectData.description}
                                    onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none h-24 resize-none"
                                    placeholder="Brief details..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all mt-4"
                            >
                                Create & Start
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
