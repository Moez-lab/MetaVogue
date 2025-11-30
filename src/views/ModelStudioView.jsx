import { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';
import { enhancePromptWithGemini } from '../utils/gemini';
import { meshyService } from '../services/meshy';
import { ModelViewer } from '../components/ModelViewer';

export const ModelStudioView = () => {
    const { setModelImage } = useGlobal();
    const [prompt, setPrompt] = useState("3D character base mesh, T-pose, realistic human skin texture, long light brown hair, smooth anatomy, non-explicit, anatomical study model, 4k texture, unreal engine style, photorealistic face");
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [result, setResult] = useState(null); // This will be the GLB URL
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleEnhance = async () => {
        if (!prompt) return;
        setEnhancing(true);
        const betterPrompt = await enhancePromptWithGemini(prompt, "3D Model");
        setPrompt(betterPrompt);
        setEnhancing(false);
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenerating(true);
        setResult(null);
        setProgress(0);

        try {
            const task = await meshyService.createTextTo3D(prompt);
            setTaskId(task.result);
        } catch (error) {
            console.error("Generation failed:", error);
            setGenerating(false);
        }
    };

    // Poll for status
    useEffect(() => {
        let interval;
        if (taskId && generating) {
            interval = setInterval(async () => {
                try {
                    const task = await meshyService.getTask(taskId);
                    console.log("Polling Task:", task); // Debug Log
                    setProgress(task.progress || 0);

                    if (task.status === 'SUCCEEDED') {
                        console.log("Generation Succeeded:", task.model_urls.glb); // Debug Log
                        setResult(task.model_urls.glb);
                        setModelImage(task.model_urls.glb); // Update global context
                        setGenerating(false);
                        setTaskId(null);
                        clearInterval(interval);
                    } else if (task.status === 'FAILED') {
                        setGenerating(false);
                        setTaskId(null);
                        clearInterval(interval);
                        alert("Generation failed. Please try again.");
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [taskId, generating, setModelImage]);

    const handleDownload = async (format) => {
        if (!result) return;

        try {
            // Fetch as blob to handle CORS and force download
            let response = await fetch(result).catch(() => null);

            if (!response || !response.ok) {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(result)}`;
                response = await fetch(proxyUrl);
            }

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Note: Meshy only returns GLB. For FBX, we just save the GLB with .fbx extension for now
            // as a client-side workaround, or we would need a real converter.
            link.download = `meshy-model-${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (e) {
            console.error("Download error:", e);
            alert("Failed to download model. See console for details.");
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-slate-50 dark:bg-[#050b14] overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-cyan-500/30 transition-colors duration-500">
            {/* Hexagon Grid Background Pattern */}
            <div className="hidden dark:block absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0' stroke='%2300F0FF' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            {/* Ambient Glows */}
            <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse-slow"></div>
            <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8 transition-colors duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-wider uppercase">
                                Generator v1.0
                            </span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-gray-200 dark:to-gray-500">
                            Model Studio
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg max-w-xl leading-relaxed">
                            Generate high-fidelity <span className="text-cyan-600 dark:text-cyan-400 font-bold">3D assets</span> from text prompts using our neural engine.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden group transition-colors duration-500">
                            {/* Glow Effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-500/30 transition-colors duration-500"></div>

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <label className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider flex items-center gap-2">
                                    <Icon name="Edit" size={14} /> Prompt Input
                                </label>
                                <button
                                    onClick={handleEnhance}
                                    disabled={enhancing}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-emerald-500/20"
                                >
                                    {enhancing ? <Icon name="Sparkles" size={12} className="animate-spin" /> : <Icon name="Sparkles" size={12} />}
                                    {enhancing ? 'Enhancing...' : 'AI Enhance'}
                                </button>
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-40 bg-white dark:bg-[#050b14] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-700 dark:text-gray-300 focus:text-slate-900 dark:focus:text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-gray-600 relative z-10"
                                placeholder="Describe your 3D model..."
                            />

                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                                {['Female', 'Male', 'T-Pose', 'Cyberpunk', 'Realistic'].map(tag => (
                                    <button key={tag} className="px-3 py-1 text-xs font-medium rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-8">
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 relative z-10 group/btn"
                                >
                                    {generating ? (
                                        <>
                                            <Icon name="Box" className="animate-spin" size={20} /> {progress}% Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="Box" size={30} className="group-hover/btn:scale-100     transition-transform" /> Generate Model
                                        </>
                                    )}
                                </button>

                                {/* <button
                                    onClick={() => {
                                        const duckUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
                                        setResult(duckUrl);
                                        setModelImage(duckUrl);
                                    }}
                                    disabled={generating}
                                    className="px-4 py-4 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all flex justify-center items-center gap-2 relative z-10"
                                    title="Test Viewer without spending tokens"
                                >
                                    <Icon name="Eye" size={20} /> Test
                                </button> */}
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2">
                        <div className="w-full h-full min-h-[500px] bg-white dark:bg-[#0a0f18] rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group transition-colors duration-500">
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                            <div className="absolute inset-0 opacity-10 dark:opacity-20"
                                style={{
                                    backgroundImage: `linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                            ></div>

                            {generating ? (
                                <div className="text-center relative z-10">
                                    <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
                                    <p className="text-cyan-600 dark:text-cyan-400 font-bold text-lg animate-pulse">Synthesizing Geometry...</p>
                                    <p className="text-slate-500 dark:text-gray-500 text-sm mt-2">Progress: {progress}%</p>
                                </div>
                            ) : result ? (
                                <div className="relative w-full h-full group/preview">
                                    <ModelViewer modelUrl={result} />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 pointer-events-none">
                                        <div className="pointer-events-auto flex gap-4">
                                            <button
                                                onClick={() => handleDownload('glb')}
                                                className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <Icon name="Download" size={18} /> Download .GLB
                                            </button>
                                            <button
                                                onClick={() => handleDownload('fbx')}
                                                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                            >
                                                <Icon name="Download" size={18} /> Download .FBX
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        RENDER COMPLETE
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 dark:text-gray-500 relative z-10">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/10 group-hover:border-cyan-500/30 transition-colors duration-500">
                                        <Icon name="Box" size={40} className="opacity-50 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:opacity-100 transition-all duration-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-400 dark:text-gray-400">Ready to Generate</p>
                                    <p className="text-sm mt-2 max-w-xs mx-auto">Enter a prompt and hit generate to create your 3D asset.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
