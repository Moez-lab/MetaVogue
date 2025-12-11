import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';
import { ModelViewer } from '../components/ModelViewer';
import { meshyService } from '../services/meshy';

export const TextureStudioView = () => {
    const { modelImage, setModelImage, updateProjectAsset } = useGlobal();
    const [textureUrl, setTextureUrl] = useState(null);

    const [texturePrompt, setTexturePrompt] = useState("3D character base mesh, T-pose, realistic human skin texture, long light brown hair, smooth anatomy, non-explicit, anatomical study model, 4k texture, unreal engine style, photorealistic face");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setModelImage(url);
        }
    };

    const handleReset = () => {
        setModelImage(null);
        setTextureUrl(null);
        setIsGenerating(false);
    };

    const handleDownload = async (format) => {
        if (!modelImage) return;

        try {
            // Fetch as blob to handle CORS and force download
            let response = await fetch(modelImage).catch(() => null);

            if (!response || !response.ok) {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(modelImage)}`;
                response = await fetch(proxyUrl);
            }

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Note: Meshy only returns GLB. For FBX/OBJ, we just save the GLB with the extension for now
            // as a client-side workaround. Real conversion requires a backend or heavy libraries.
            link.download = `textured-model-${Date.now()}.${format}`;
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
        if (!modelImage || !texturePrompt) return;
        setIsGenerating(true);

        try {
            let modelUrlToUse = modelImage;

            // Meshy API cannot access local blob URLs. We must convert to Data URI.
            if (modelImage.startsWith('blob:')) {
                console.log("Converting blob URL to Data URI...");
                const response = await fetch(modelImage);
                const blob = await response.blob();

                // Convert blob to base64
                const base64Result = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                // Force correct MIME type for GLB to ensure Meshy accepts it
                // Some browsers might set it to application/octet-stream
                modelUrlToUse = base64Result.replace(/^data:.*?;base64,/, 'data:model/gltf-binary;base64,');
                console.log("Conversion complete. Data URI prefix:", modelUrlToUse.substring(0, 50) + "...");
            } else {
                console.log("Using public URL:", modelUrlToUse);
            }

            // 1. Construct Enhanced Prompt with Safety & Gender
            const safetyEnforcement = "wearing solid opaque beige sports bra and panties, thick cotton fabric, no transparency, modest coverage, safe for work";
            const finalPrompt = `${texturePrompt}, ${safetyEnforcement}`;
            console.log("Sending Prompt:", finalPrompt);

            // 2. Create Retexture Task
            console.log("Starting retexture task...");
            const task = await meshyService.createRetextureTask(modelUrlToUse, finalPrompt);
            const taskId = task.result;
            console.log("Retexture Task ID:", taskId);

            // 3. Poll for completion
            const interval = setInterval(async () => {
                try {
                    const status = await meshyService.getRetextureTask(taskId);
                    console.log("Retexture Status:", status);

                    if (status.status === 'SUCCEEDED') {
                        clearInterval(interval);

                        // Meshy Retexture V1 returns `model_urls.glb` which is the textured model!
                        if (status.model_urls && status.model_urls.glb) {
                            console.log("Retexture complete, new model:", status.model_urls.glb);
                            // Update global context to show the new textured model
                            setModelImage(status.model_urls.glb);

                            // Update Active Project
                            updateProjectAsset('texture', status.model_urls.glb, texturePrompt);

                            setTextureUrl(null); // Clear any overlay
                        } else if (status.status === 'FAILED') {
                            clearInterval(interval);
                            alert(`Texture generation failed: ${status.task_error?.message || "Unknown error"}`);
                        }
                        setIsGenerating(false);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                    setIsGenerating(false);
                    clearInterval(interval);
                }
            }, 2000);

        } catch (error) {
            console.error("Texture generation error:", error);
            setIsGenerating(false);
            alert(`Failed to start texture generation: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen w-full relative bg-slate-50 dark:bg-[#050b14] overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-cyan-500/30 transition-colors duration-500">
            {/* Background Pattern */}
            <div className="hidden dark:block absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0' stroke='%2300F0FF' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-wider uppercase">
                                Texture Lab v1.0
                            </span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-gray-200 dark:to-gray-500">
                            Texture Studio
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg max-w-xl leading-relaxed">
                            Apply <span className="text-purple-600 dark:text-purple-400 font-bold">AI-generated materials</span> to your 3D assets.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">

                            {!modelImage ? (
                                <div className="mb-8 p-6 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-center hover:border-purple-500/50 transition-colors">
                                    <Icon name="Upload" size={32} className="mx-auto mb-4 text-slate-400" />
                                    <p className="text-sm font-bold mb-2">No Model Selected</p>
                                    <p className="text-xs text-slate-500 mb-4">Generate one in Model Studio or upload here</p>
                                    <input
                                        type="file"
                                        accept=".glb,.gltf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="model-upload"
                                    />
                                    <label htmlFor="model-upload" className="px-4 py-2 bg-slate-200 dark:bg-white/10 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                                        Upload .GLB
                                    </label>
                                </div>
                            ) : (
                                <div className="mb-6 p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center text-slate-500">
                                                <Icon name="Cube" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-white">Current Model</p>
                                                <p className="text-[10px] text-slate-500">Ready for texturing</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReset}
                                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                            title="Remove Model"
                                        >
                                            <Icon name="Trash" size={18} />
                                        </button>
                                    </div>
                                    <label className="w-full py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors">
                                        <Icon name="Upload" size={14} /> Replace Model
                                        <input
                                            type="file"
                                            accept=".glb,.gltf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-2">
                                    <Icon name="Palette" size={14} /> Texture Prompt
                                </label>

                            <textarea
                                value={texturePrompt}
                                onChange={(e) => setTexturePrompt(e.target.value)}
                                className="w-full h-32 bg-white dark:bg-[#050b14] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm outline-none focus:border-purple-500/50 transition-all resize-none"
                                placeholder="Describe the material (e.g., worn leather, holographic metal)..."
                            />
                            <button
                                onClick={handleApplyTexture}
                                disabled={!modelImage || isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Icon name="Loader" className="animate-spin" size={20} /> Applying...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="Sparkles" size={20} /> Generate Texture
                                    </>
                                )}
                            </button>

                            {modelImage && !isGenerating && (
                                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                                        Download Options
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleDownload('fbx')}
                                            className="col-span-2 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all group"
                                        >
                                            <span className="flex items-center justify-center translate-x-6 w-8 p-2 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                                                <Icon name="Download" size={22} />
                                            </span>
                                            <span>Download FBX (Recommended)</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownload('glb')}
                                            className="py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg font-bold text-xs transition-all"
                                        >
                                            .GLB
                                        </button>
                                        <button
                                            onClick={() => handleDownload('obj')}
                                            className="py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg font-bold text-xs transition-all"
                                        >
                                            .OBJ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2">
                    <div className="w-full h-full min-h-[500px] bg-white dark:bg-[#0a0f18] rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                        {modelImage ? (
                            <ModelViewer url={modelImage} textureUrl={textureUrl} />
                        ) : (
                            <div className="text-center text-slate-500 dark:text-gray-500">
                                <Icon name="Cube" size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Load a model to start texturing</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
};
