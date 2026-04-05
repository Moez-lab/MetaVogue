import { useState } from 'react';
import { forgotPassword } from '../services/api';
import { Icon } from '../components/Icon';
import logo from '../assets/logo.png';

export const ForgotPasswordView = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await forgotPassword(email);
            setMessage(res.message);
            if (res.previewUrl) {
                setPreviewUrl(res.previewUrl);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0d1117] font-sans text-white p-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none text-white">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors font-medium bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 hover:scale-105 active:scale-95 duration-200 group"
            >
                <Icon name="ArrowLeft" size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Login
            </button>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                <div className="bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto mb-6">
                            <img src={logo} alt="MetaVogue Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
                        <p className="text-white/50 text-sm">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {message ? (
                        <div className="space-y-6 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <Icon name="CheckCircle" size={32} />
                            </div>
                            <p className="text-white/80 font-medium">{message}</p>
                            
                            {previewUrl && (
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl mt-4">
                                    <p className="text-xs text-primary font-bold uppercase mb-2">Lab Mode: Mock Email</p>
                                    <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-white underline hover:text-primary transition-colors block break-all"
                                    >
                                        Click here to view the reset email
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={onBack}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all border border-white/10"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
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

                            {error && (
                                <div className="text-red-400 text-sm flex items-center gap-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                    <Icon name="AlertCircle" size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-transparent border border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending Link...' : 'Request Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
