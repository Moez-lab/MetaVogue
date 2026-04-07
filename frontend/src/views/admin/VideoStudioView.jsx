import { useState } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { enhancePromptWithGemini } from '../../utils/gemini';

export const VideoStudioView = () => {
    const { modelImage, shirtImage } = useGlobal();
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [progress, setProgress] = useState(0);

    const isReady = modelImage && shirtImage;

    const handleEnhance = async () => {
        if (!prompt) return;
        setEnhancing(true);
        const betterPrompt = await enhancePromptWithGemini(prompt, "Fashion Video Motion");
        setPrompt(betterPrompt);
        setEnhancing(false);
    };

    const handleGenerate = () => {
        if (!isReady) return;
        setGenerating(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 1;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setGenerating(false);
            }
        }, 50); // 5 seconds sim
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Motion Studio</h2>

            {!isReady ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <Icon name="AlertCircle" size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">Assets Missing</h3>
                    <p className="text-slate-500 max-w-md">You need both a 3D Model and a Garment to generate a video. Please complete the previous steps.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Left Panel: Inputs */}
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-surface">
                                <p className="text-xs font-bold text-slate-500 mb-2">TARGET MODEL</p>
                                <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden">
                                    <img src={modelImage} className="w-full h-full object-cover" alt="Model" />
                                </div>
                            </div>
                            <div className="flex items-center text-slate-300">
                                <Icon name="ArrowRight" />
                            </div>
                            <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-surface">
                                <p className="text-xs font-bold text-slate-500 mb-2">GARMENT</p>
                                <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden">
                                    <img src={shirtImage} className="w-full h-full object-cover" alt="Garment" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold dark:text-white">Motion Prompt</label>
                                <button
                                    onClick={handleEnhance}
                                    disabled={enhancing}
                                    className="text-xs font-bold text-secondary hover:text-white hover:bg-secondary px-2 py-1 rounded-md transition-all flex items-center gap-1"
                                >
                                    {enhancing ? <Icon name="Sparkles" size={12} className="animate-spin" /> : <Icon name="Sparkles" size={12} />}
                                    {enhancing ? 'Enhancing...' : 'Magic Enhance'}
                                </button>
                            </div>
                            <textarea
                                className="w-full h-32 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary outline-none resize-none dark:text-white mb-4"
                                placeholder="Describe movement (e.g., Catwalk, Spin, Jump...)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full py-4 bg-gradient-to-r from-secondary to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {generating ? 'Processing...' : <><Icon name="Video" size={20} /> Generate Video</>}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Player */}
                    <div className="glass-card rounded-2xl p-2 flex items-center justify-center bg-black relative overflow-hidden">
                        {generating ? (
                            <div className="w-full max-w-md">
                                <div className="flex justify-between text-xs text-white mb-2 font-bold">
                                    <span>Rendering Physics...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-secondary to-pink-500 transition-all duration-75"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : progress === 100 ? (
                            <div className="relative w-full h-full">
                                <img src={modelImage} className="w-full h-full object-cover opacity-80" alt="Video Preview" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                        <Icon name="Play" size={32} className="text-white ml-1" />
                                    </button>
                                </div>
                                {/* Mock Timeline */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="w-full h-1 bg-white/30 rounded-full mb-2">
                                        <div className="w-1/3 h-full bg-secondary rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between text-white text-xs font-mono">
                                        <span>00:04</span>
                                        <span>00:12</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-600">
                                <Icon name="Video" size={64} className="mx-auto mb-4 opacity-20" />
                                <p>Preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
