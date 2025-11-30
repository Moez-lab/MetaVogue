import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';

export const LoginView = ({ onBack }) => {
    const { login } = useGlobal();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login - accept any credentials for now
        login({ name: name || 'User', email });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0d1117] font-sans selection:bg-primary/30 text-white p-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors font-medium bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 hover:scale-105 active:scale-95 duration-200 group"
            >
                <Icon name="ArrowLeft" size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </button>

            {/* Main Split Card Wrapper - No Overflow Hidden here to allow pop-out */}
            <div className="w-full max-w-5xl h-[650px] relative flex animate-fade-in-up">

                {/* Inner Card Background & Content (Clipped) */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex z-0">
                    {/* Left Side Background */}
                    <div className="hidden md:block w-5/12 bg-gradient-to-br from-primary via-purple-600 to-secondary relative">
                        {/* Wavy Divider */}
                        <div className="absolute top-0 right-0 bottom-0 w-24 h-full pointer-events-none translate-x-[1px] z-20">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-black/40 fill-current" style={{ color: 'rgba(0,0,0,0.4)' }}>
                                <path d="M100 0 L 100 100 L 0 100 C 50 70 80 30 0 0 Z" fill="#0d1117" opacity="0.4" />
                                <path d="M100 0 L 100 100 L 0 100 C 50 70 80 30 0 0 Z" fill="currentColor" />
                            </svg>
                        </div>
                    </div>
                    {/* Right Side Background (Transparent) */}
                    <div className="w-full md:w-7/12 bg-transparent"></div>
                </div>

                {/* Content Layer (Above Background, Below Image if needed, or Image is separate) */}

                {/* Left Side Content - Visuals */}
                <div className="hidden md:flex w-5/12 relative flex-col justify-between p-12 text-white z-10 pointer-events-none">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <Icon name="Cube" size={20} className="text-white" />
                                </div>
                                <span className="font-bold text-xl tracking-wide">MetaVogue</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black leading-[0.9] mb-6 drop-shadow-2xl tracking-tighter">
                                {isSignUp ? (
                                    <>
                                        JOIN THE<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">REVOLUTION</span>
                                    </>
                                ) : (
                                    <>
                                        WELCOME<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">BACK</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-white/60 text-base font-medium leading-relaxed max-w-xs border-l-2 border-white/20 pl-4">
                                {isSignUp
                                    ? 'Create, customize, and wear your digital identity. The future of fashion is here.'
                                    : 'Access your studio and continue crafting your digital masterpiece.'}
                            </p>
                        </div>

                        <div className="text-xs text-white/60 mt-4">
                            © 2025 MetaVogue Inc.
                        </div>
                    </div>
                </div>

                {/* Fashion Girl Visual - POP OUT (Absolute, High Z-Index) */}
                <div className="hidden md:block absolute bottom-0 left-0 w-5/12 h-[115%] z-20 pointer-events-none flex items-end justify-center pb-0 overflow-visible">
                    {/* Glow Effect behind her */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-gradient-to-t from-black/50 to-transparent blur-2xl"></div>

                    <img
                        src="/login_girl_transparent.png"
                        alt="Fashion Girl"
                        className="relative w-[110%] max-w-none h-auto object-contain object-bottom -mb-24 -ml-24 translate-y-90 translate-x-22 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-700"
                    />
                </div>

                {/* Right Form Section - Content */}
                <div className="w-full md:w-7/12 relative flex flex-col justify-center p-8 md:p-16 z-10">
                    {/* Mobile Header (Visible only on small screens) */}
                    <div className="md:hidden text-center mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">MetaVogue</h2>
                        <p className="text-white/60 text-sm">AI Fashion Studio</p>
                    </div>

                    <div className="max-w-sm mx-auto w-full">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isSignUp ? 'Sign up' : 'Sign in'}
                        </h2>
                        <p className="text-white/50 text-sm mb-10">
                            {isSignUp
                                ? 'Ready to get started? Create an account in seconds.'
                                : 'Enter your details to access your workspace.'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {isSignUp && (
                                <div className="group relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="peer w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-transparent focus:border-primary focus:outline-none transition-colors"
                                        placeholder="Name"
                                        id="name"
                                        required
                                    />
                                    <label
                                        htmlFor="name"
                                        className="absolute left-0 -top-3.5 text-xs text-primary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary"
                                    >
                                        Name
                                    </label>
                                </div>
                            )}

                            <div className="group relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-transparent focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Email"
                                    id="email"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 -top-3.5 text-xs text-primary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    E-mail
                                </label>
                            </div>

                            <div className="group relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-transparent focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Password"
                                    id="password"
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-0 -top-3.5 text-xs text-primary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    Password
                                </label>
                                <button type="button" className="absolute right-0 top-2 text-white/30 hover:text-white transition-colors">
                                    <Icon name="Eye" size={18} />
                                </button>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-transparent border border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]"
                                >
                                    {isSignUp ? 'Register' : 'Log In'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-white/40 text-sm">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="font-bold text-white hover:text-primary transition-colors ml-1"
                                >
                                    {isSignUp ? 'Log in' : 'Sign up'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
