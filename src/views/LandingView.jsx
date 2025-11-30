import { Icon } from '../components/Icon';
import { ModelViewer } from '../components/ModelViewer';
import logo from '../assets/logo.png';
import model071 from '../assets/workflow/3d human/textured-model-1764410569071.glb';
import model152 from '../assets/workflow/3d human/textured-model-1764410686152.glb';
import shirt2d from '../assets/workflow/clothes/2dshirt.png';
import shirt3d from '../assets/workflow/clothes/3dshirt.glb';

export const LandingView = ({ onGetStarted, onSignIn }) => {
    return (
        <div className="min-h-screen bg-[#0d1117] text-white font-sans overflow-x-hidden selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                            <img src={logo} alt="MetaVogue Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">MetaVogue</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onSignIn}
                            className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-lg hover:bg-white/90 transition-all hover:scale-105 border border-transparent hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs font-medium text-white/80">v2.0 Now Available</span>
                            </div>

                            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                The Future of <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x">
                                    Digital Fashion
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                Generate, texture, and animate 3D garments with the power of AI.
                                Streamline your workflow from concept to virtual runway in minutes.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <button
                                    onClick={onGetStarted}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Start Creating <Icon name="ArrowRight" size={20} />
                                </button>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-400 px-4">
                                    <span className="flex items-center gap-2"><Icon name="Check" size={16} className="text-green-400" /> No credit card</span>
                                    <span className="flex items-center gap-2"><Icon name="Check" size={16} className="text-green-400" /> 7-day free trial</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="flex-1 relative animate-float-slow">
                            <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                                {/* Glowing Globe Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse-slow"></div>
                                <div className="absolute inset-4 bg-[#0d1117] rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                                    {/* Mock Interface */}
                                    <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-4 h-full">
                                        <div className="space-y-4">
                                            {/* Mock Prompt Input */}
                                            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <Icon name="Sparkles" size={12} className="text-primary" />
                                                    <span>Prompt</span>
                                                </div>
                                                <div className="text-xs text-white/80 leading-relaxed font-mono">
                                                    "Cyberpunk street wear jacket, neon blue accents, high collar, matte black fabric..."
                                                </div>
                                            </div>

                                            {/* Mock Sliders */}
                                            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-400">
                                                        <span>Creativity</span>
                                                        <span>85%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary"></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-400">
                                                        <span>Detail</span>
                                                        <span>High</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full w-[60%] bg-slate-500"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mock Swatches */}
                                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                                <div className="text-[10px] text-slate-400 mb-2">Materials</div>
                                                <div className="flex gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/20 ring-2 ring-primary/50"></div>
                                                    <div className="w-6 h-6 rounded-full bg-blue-900/50 border border-white/20"></div>
                                                    <div className="w-6 h-6 rounded-full bg-purple-900/50 border border-white/20"></div>
                                                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                                        <Icon name="Plus" size={10} className="text-white/50" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Area - Apple Mirror Effect */}
                                        <div className="h-full rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group p-6 backdrop-blur-2xl shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]">
                                            {/* Mirror/Glass Shine Reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                                            <div className="absolute -inset-full top-0 block h-[200%] w-1/2 -rotate-12 bg-gradient-to-r from-transparent to-white/10 opacity-20 blur-2xl pointer-events-none"></div>

                                            {/* Noise Texture Overlay */}
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                                            {/* AI Processing Visual */}
                                            <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                                                {/* Elegant Spinner */}
                                                <div className="relative">
                                                    {/* Outer Glow */}
                                                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse-slow"></div>

                                                    {/* Rings */}
                                                    <div className="w-20 h-20 rounded-full border-[3px] border-white/10 border-t-white/80 animate-spin"></div>
                                                    <div className="absolute inset-2 rounded-full border-[3px] border-white/5 border-b-white/50 animate-spin-slow direction-reverse"></div>

                                                    {/* Center Icon */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Icon name="Sparkles" size={24} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Status Text */}
                                                <div className="text-center space-y-3">
                                                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight">
                                                        Generating Assets
                                                    </div>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                        <span className="text-xs text-white/50 font-medium tracking-wide uppercase">Processing Nodes</span>
                                                    </div>
                                                </div>

                                                {/* Premium Progress Bar */}
                                                <div className="w-full max-w-[240px] space-y-3">
                                                    <div className="flex justify-between text-[10px] text-white/40 font-semibold tracking-wider uppercase">
                                                        <span>Progress</span>
                                                        <span>78%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                                        <div className="h-full w-[78%] bg-gradient-to-r from-white/80 to-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-[shimmer_2s_infinite]"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute -right-8 top-20 p-4 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                            <Icon name="CheckCircle" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400">Status</div>
                                            <div className="font-bold text-white">Render Complete</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -left-8 bottom-20 p-4 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <Icon name="Zap" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400">Generation Time</div>
                                            <div className="font-bold text-white">0.4s</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 px-6 bg-[#0d1117] relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Everything you need</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            A complete suite of AI-powered tools designed for the modern fashion designer.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-3xl bg-[#161b22] border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <Icon name="Cube" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">3D Model Generation</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Turn text prompts into production-ready 3D meshes. Compatible with standard industry tools.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-3xl bg-[#161b22] border border-white/5 hover:border-secondary/50 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                                <Icon name="Palette" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Texturing</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Apply realistic fabrics and patterns with context-aware AI mapping technology.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-3xl bg-[#161b22] border border-white/5 hover:border-pink-500/50 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                                <Icon name="Video" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Motion Studio</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Create stunning runway animations and showcase videos in seconds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflow Visualization */}
            <div className="py-24 px-6 bg-[#0d1117] relative border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Seamless Workflow</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            From base mesh to fully textured asset in one click.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-24">
                        {/* Step 1: Base Model */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-[300px] h-[400px] bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden relative">
                                <ModelViewer url={model152} showDownload={false} cameraPosition={[0, 0, 2.5]} />
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                                        01. Base Generation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex flex-col items-center gap-2 text-primary animate-pulse">
                            <Icon name="ArrowRight" size={48} />
                            <span className="text-xs font-bold tracking-widest uppercase">AI Processing</span>
                        </div>
                        <div className="md:hidden text-primary animate-pulse my-4">
                            <Icon name="ArrowDown" size={32} />
                        </div>

                        {/* Step 2: Textured Model */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-[300px] h-[400px] bg-[#161b22] rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.2)] overflow-hidden relative">
                                <ModelViewer url={model071} showDownload={false} cameraPosition={[0, 0, 2.5]} />
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                    <span className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-xs font-bold border border-primary/30 text-white">
                                        02. Smart Texture Applied
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* Step 1: 2D Shirt Image */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-[300px] h-[400px] bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center p-4">
                                <img src={shirt2d} alt="2D Shirt" className="w-full h-full object-contain" />
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                                        01. 2D Design
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex flex-col items-center gap-2 text-primary animate-pulse">
                            <Icon name="ArrowRight" size={48} />
                            <span className="text-xs font-bold tracking-widest uppercase">AI Processing</span>
                        </div>
                        <div className="md:hidden text-primary animate-pulse my-4">
                            <Icon name="ArrowDown" size={32} />
                        </div>

                        {/* Step 2: 3D Shirt Model */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-[300px] h-[400px] bg-[#161b22] rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.2)] overflow-hidden relative">
                                <ModelViewer url={shirt3d} showDownload={false} cameraPosition={[0, 0, 2.5]} />
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                    <span className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-xs font-bold border border-primary/30 text-white">
                                        02. 3D Asset
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] to-primary/10 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tight">
                        Ready to design the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">impossible?</span>
                    </h2>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        Get Started for Free
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10 bg-[#0d1117]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Icon name="Cube" size={16} />
                        <span>© 2025 MetaVogue AI Inc.</span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
