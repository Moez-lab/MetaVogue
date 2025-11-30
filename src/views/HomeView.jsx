import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const HomeView = () => {
    const { modelImage, shirtImage, setCurrentView } = useGlobal();

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
                            <WorkflowStep
                                step="01"
                                title="Generate 3D Model"
                                desc="Base mesh generation from prompt"
                                status="done"
                            />
                            <WorkflowStep
                                step="02"
                                title="Texture Synthesis"
                                desc="AI-driven fabric mapping & material generation"
                                status="current"
                                action="Processing..."
                                onClick={() => setCurrentView('texture')}
                            />
                            <WorkflowStep
                                step="03"
                                title="Virtual Try-On"
                                desc="Avatar fitting and physics simulation"
                                status="pending"
                            />
                            <WorkflowStep
                                step="04"
                                title="Cinematic Render"
                                desc="4K video generation with ray-tracing"
                                status="pending"
                            />
                        </div>
                    </div>

                    {/* Right Column: Visuals & Stats */}
                    <div className="space-y-8">
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
        </div>
    );
};
