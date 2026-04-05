import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/api';
import { Icon } from '../components/Icon';
import logo from '../assets/logo.png';

export const ResetPasswordView = ({ onBack }) => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await resetPasswordWithToken(token, password);
            setMessage(res.message);
            // After 3 seconds, redirect to login
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d1117] text-white p-4 text-center">
                <Icon name="AlertCircle" size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
                <p className="text-white/50 mb-6">No reset token found in the URL.</p>
                <button onClick={() => navigate('/login')} className="px-6 py-2 bg-primary rounded-full font-bold">
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0d1117] font-sans text-white p-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none text-white">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                <div className="bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto mb-6">
                            <img src={logo} alt="MetaVogue Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
                        <p className="text-white/50 text-sm">
                            Enter your new password below to regain access to your account.
                        </p>
                    </div>

                    {message ? (
                        <div className="space-y-6 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <Icon name="CheckCircle" size={32} />
                            </div>
                            <p className="text-white/80 font-medium">Your password has been successfully updated!</p>
                            <p className="text-white/50 text-xs">Redirecting to login page...</p>
                            
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all border border-white/10"
                            >
                                Continue to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="group relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-transparent focus:border-primary focus:outline-none transition-colors"
                                    placeholder="New Password"
                                    id="password"
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-0 -top-3.5 text-xs text-primary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    New Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-2 text-white/30 hover:text-white transition-colors"
                                >
                                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                                </button>
                            </div>

                            <div className="group relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-transparent focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Confirm Password"
                                    id="confirmPassword"
                                    required
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="absolute left-0 -top-3.5 text-xs text-primary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    Confirm Password
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
                                    {loading ? 'Updating Password...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
