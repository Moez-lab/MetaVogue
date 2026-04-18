import { useState, useEffect, memo } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { enhancePromptWithGemini } from '../../utils/gemini';
import { meshyService } from '../../services/meshy';
import { ModelViewer } from '../../components/ModelViewer';

export const ModelStudioView = () => {
    const { setModelImage, updateProjectAsset } = useGlobal();
    const [prompt, setPrompt] = useState("3D character base mesh, T-pose, realistic human skin texture, long light brown hair, smooth anatomy, non-explicit, anatomical study model, 4k texture, unreal engine style, photorealistic face");
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [result, setResult] = useState(null); // This will be the GLB URL
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);

    // Texture State
    const [texturePrompt, setTexturePrompt] = useState("3D character base mesh, T-pose, realistic human skin texture, long light brown hair, smooth anatomy, non-explicit, anatomical study model, 4k texture, unreal engine style, photorealistic face");
    const [isTexturing, setIsTexturing] = useState(false);

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

    const handleTagClick = (tag) => {
        const regex = new RegExp(`\\b${tag}\\b`, 'i');
        if (!regex.test(prompt)) {
            setPrompt(prev => prev ? `${prev}, ${tag}` : tag);
        } else {
            // Remove tag, handling preceding comma if present
            setPrompt(prev => {
                const newPrompt = prev.replace(new RegExp(`(, )?\\b${tag}\\b`, 'i'), '')
                    .replace(/^, /, '') // Fix leading comma if first item was removed
                    .trim();
                return newPrompt;
            });
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

                        // Update Active Project
                        updateProjectAsset('model', task.model_urls.glb, prompt);

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

    const handleApplyTexture = async () => {
        if (!result || !texturePrompt) return;
        setIsTexturing(true);

        try {
            let modelUrlToUse = result;

            if (result.startsWith('blob:')) {
                const response = await fetch(result);
                const blob = await response.blob();
                const base64Result = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                modelUrlToUse = base64Result.replace(/^data:.*?;base64,/, 'data:model/gltf-binary;base64,');
            }

            const safetyEnforcement = "wearing solid opaque beige sports bra and panties, thick cotton fabric, no transparency, modest coverage, safe for work";
            const finalPrompt = `${texturePrompt}, ${safetyEnforcement}`;
            
            const task = await meshyService.createRetextureTask(modelUrlToUse, finalPrompt);
            const task_id = task.result;

            const interval = setInterval(async () => {
                try {
                    const status = await meshyService.getRetextureTask(task_id);
                    if (status.status === 'SUCCEEDED') {
                        clearInterval(interval);
                        if (status.model_urls && status.model_urls.glb) {
                            setResult(status.model_urls.glb);
                            setModelImage(status.model_urls.glb);
                            updateProjectAsset('texture', status.model_urls.glb, texturePrompt);
                        } else {
                            alert("Generation failed");
                        }
                        setIsTexturing(false);
                    } else if (status.status === 'FAILED') {
                        clearInterval(interval);
                        setIsTexturing(false);
                        alert(`Texture generation failed: ${status.task_error?.message || "Unknown error"}`);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                    setIsTexturing(false);
                    clearInterval(interval);
                }
            }, 2000);

        } catch (error) {
            console.error("Texture generation error:", error);
            setIsTexturing(false);
            alert(`Failed to start texture generation: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-cyan-500/30 transition-colors duration-500">
            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-12 pb-20">
                {/* Header Section - Dashboard Styled */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Model Studio</h2>
                        <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-[0.3em] opacity-80">NEURAL ASSET GENERATION</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-2xl glass-premium border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
                            Engine v2.0
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-premium p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <label className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 tracking-[0.2em] flex items-center gap-2 font-black">
                                    <Icon name="Edit" size={14} /> Prompt Lab
                                </label>
                                <button
                                    onClick={handleEnhance}
                                    disabled={enhancing}
                                    className="text-[10px] font-black text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 border border-cyan-500/20 uppercase tracking-widest"
                                >
                                    {enhancing ? <Icon name="Sparkles" size={12} className="animate-spin text-white" /> : <Icon name="Sparkles" size={12} />}
                                    {enhancing ? 'Optimizing...' : 'AI Enhance'}
                                </button>
                            </div>
 
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-44 bg-white/5 dark:bg-black/40 border border-white/10 rounded-[1.5rem] p-5 text-sm text-slate-700 dark:text-white focus:border-cyan-500/50 outline-none resize-none transition-all placeholder-slate-500 font-medium leading-relaxed"
                                placeholder="Describe your 3D model with detail..."
                            />

                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                                {['Female', 'Male', 'T-Pose', 'Cyberpunk', 'Realistic'].map(tag => {
                                    const isActive = new RegExp(`\\b${tag}\\b`, 'i').test(prompt);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagClick(tag)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${isActive
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                                                    : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-3 relative z-10"
                                >
                                    {generating ? (
                                        <>
                                            <Icon name="RefreshCw" className="animate-spin" size={18} /> {progress}% Processing
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="Box" size={18} /> Generate Mission
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2">
                        <div className="w-full h-full min-h-[550px] glass-premium rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                            {/* Grid Overlay - Optimized */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
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
                                    <ModelViewer url={result} />

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

                {/* ── Texture Lab Section ── */}
                <div className="mt-8 space-y-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Material Lab</h3>
                        <span className="px-3 py-1 rounded-full glass-premium border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase">
                            Procedural Beta
                        </span>
                    </div>
 
                    <div className="glass-premium p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group max-w-3xl">
                        <div className="relative z-10 space-y-8">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-[0.2em] flex items-center gap-2 mb-4 text-indigo-400">
                                    <Icon name="Palette" size={14} /> Surface Parameters
                                </label>
                                <textarea
                                    value={texturePrompt}
                                    onChange={(e) => setTexturePrompt(e.target.value)}
                                    className="w-full h-36 bg-white/5 dark:bg-black/40 border border-white/10 rounded-[1.5rem] p-5 text-sm text-slate-700 dark:text-white focus:border-indigo-500/50 outline-none resize-none transition-all placeholder-slate-500 font-medium"
                                    placeholder="Define material composition (e.g. Damascus steel, carbon fiber)..."
                                />
                            </div>
 
                            <button
                                onClick={handleApplyTexture}
                                disabled={!result || isTexturing}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-700 hover:scale-[1.02] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-3 relative z-10 shadow-lg shadow-indigo-500/20"
                            >
                                {isTexturing ? (
                                    <>
                                        <Icon name="RefreshCw" className="animate-spin" size={18} /> Processing Materials
                                    </>
                                ) : (
                                    <>
                                        <Icon name="Sparkles" size={18} /> {result ? 'Synthesize Texture' : 'Awaiting Model Output'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
