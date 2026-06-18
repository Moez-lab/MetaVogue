import { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { enhancePromptWithGemini } from '../../utils/gemini';
import { BASE_URL, generateVideo, getReplicateTaskStatus, uploadFile } from '../../services/api';

export const VideoStudioView = () => {
    const { modelImage, shirtImage } = useGlobal();
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [prompt, setPrompt] = useState('');
    const [promptOptimizer, setPromptOptimizer] = useState(true);
    const [useSubjectReference, setUseSubjectReference] = useState(false);
    
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    // Auto-populate with modelImage if available in the global context
    useEffect(() => {
        if (modelImage && !image) {
            setImage(modelImage);
            setImagePreview(modelImage.startsWith('http') ? modelImage : `${BASE_URL}${modelImage}`);
        }
    }, [modelImage]);

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadCustomImage(e.dataTransfer.files[0]);
        }
    };

    // Trigger file input dialog
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file input selection
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadCustomImage(file);
    };

    // Upload custom image
    const uploadCustomImage = async (file) => {
        try {
            setUploadingImage(true);
            setError('');
            const res = await uploadFile(file);
            setImage(res.url);
            setImagePreview(res.url.startsWith('http') ? res.url : `${BASE_URL}${res.url}`);
        } catch (err) {
            console.error("Failed to upload image:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    // Quick select from global workspace assets
    const handleQuickSelect = (assetPath) => {
        setImage(assetPath);
        setImagePreview(assetPath.startsWith('http') ? assetPath : `${BASE_URL}${assetPath}`);
    };

    // Enhance prompt using Gemini
    const handleEnhance = async () => {
        if (!prompt) return;
        setEnhancing(true);
        try {
            const betterPrompt = await enhancePromptWithGemini(prompt, "Fashion Video Motion");
            setPrompt(betterPrompt);
        } catch (err) {
            console.error("Prompt enhance error:", err);
        } finally {
            setEnhancing(false);
        }
    };

    // Start video generation
    const handleGenerate = async () => {
        if (!image || !prompt) return;
        
        setGenerating(true);
        setVideoUrl('');
        setError('');
        setProgress(5);
        setStatusMessage('Initiating video generation...');

        // Fake progressive bar to show activity while polling
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                const increment = prev < 40 ? 2 : prev < 75 ? 1 : 0.5;
                return Math.min(prev + increment, 95);
            });
        }, 1000);

        try {
            const result = await generateVideo(image, prompt, promptOptimizer, useSubjectReference);
            console.log("Prediction submitted:", result);
            
            const predictionId = result.result?.id;
            if (!predictionId) {
                throw new Error("No prediction ID returned from backend.");
            }

            setStatusMessage('Prediction started. Waiting for queue...');
            
            let isCompleted = false;
            let attempts = 0;
            const maxAttempts = 180; // 6 minutes max polling

            while (!isCompleted && attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                try {
                    const statusRes = await getReplicateTaskStatus(predictionId);
                    const predictionData = statusRes.data;
                    const status = predictionData?.status;
                    
                    console.log(`Poll ${attempts}: status = ${status}`);

                    if (status === 'succeeded') {
                        clearInterval(progressInterval);
                        setProgress(100);
                        setStatusMessage('Success! Downloading video...');
                        
                        const output = predictionData.output;
                        const videoPath = Array.isArray(output) ? output[0] : output;
                        if (!videoPath) {
                            throw new Error("Replicate completed but did not return a video output URL.");
                        }
                        setVideoUrl(videoPath);
                        isCompleted = true;
                    } else if (status === 'failed') {
                        clearInterval(progressInterval);
                        setError(predictionData.error || 'Video generation failed.');
                        isCompleted = true;
                    } else if (status === 'canceled') {
                        clearInterval(progressInterval);
                        setError('Video generation was canceled.');
                        isCompleted = true;
                    } else if (status === 'processing') {
                        setStatusMessage('Generating frames...');
                    } else if (status === 'starting') {
                        setStatusMessage('Warming up AI engine...');
                    }
                } catch (pollErr) {
                    console.warn("Polling status check failed:", pollErr);
                }
            }

            if (!isCompleted) {
                clearInterval(progressInterval);
                setError('Generation timed out. The model might still be processing.');
            }

        } catch (err) {
            console.error("Video generation error:", err);
            clearInterval(progressInterval);
            setError(err.message || 'Failed to start video generation.');
        } finally {
            setGenerating(false);
        }
    };

    // Download generated video
    const handleDownload = async () => {
        if (!videoUrl) return;
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Fashion-Motion-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download video, opening in new window instead:", err);
            window.open(videoUrl, '_blank');
        }
    };

    const handleClearImage = () => {
        setImage('');
        setImagePreview('');
    };

    return (
        <div className="p-8 h-full flex flex-col no-scrollbar">
            <div className="mb-6">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                    <Icon name="Video" className="text-secondary" /> Motion Studio
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Animate fashion portraits or garment designs into high-quality runway walks using Minimax AI.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Left Panel: Inputs */}
                <div className="space-y-6 flex flex-col overflow-y-auto no-scrollbar pr-2">
                    
                    {/* Workspace Quick Select (If assets are available) */}
                    {(modelImage || shirtImage) && (
                        <div className="p-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-[#111827]/50 backdrop-blur">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-400 mb-3 tracking-wider uppercase">Workspace Assets</p>
                            <div className="flex gap-4">
                                {modelImage && (
                                    <button 
                                        onClick={() => handleQuickSelect(modelImage)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                    >
                                        <Icon name="User" size={14} /> Import Model Image
                                    </button>
                                )}
                                {shirtImage && (
                                    <button 
                                        onClick={() => handleQuickSelect(shirtImage)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                    >
                                        <Icon name="Shirt" size={14} /> Import Garment Image
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Image Uploader */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827]/60 shadow-sm">
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-3">
                            First Frame Image <span className="text-red-500">*</span>
                        </label>
                        
                        {imagePreview ? (
                            <div className="relative rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden aspect-video max-h-56 bg-slate-50 dark:bg-[#050b14] group">
                                <img 
                                    src={imagePreview} 
                                    alt="First Frame Source" 
                                    className="w-full h-full object-contain"
                                />
                                <button 
                                    onClick={handleClearImage}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 hover:scale-105 transition-all"
                                >
                                    <Icon name="X" size={16} />
                                </button>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={handleUploadClick}
                                        className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg shadow hover:bg-slate-100 transition"
                                    >
                                        Replace Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={handleUploadClick}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                    dragActive 
                                        ? "border-secondary bg-secondary/5" 
                                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-[#050b14]/50"
                                }`}
                            >
                                {uploadingImage ? (
                                    <div className="space-y-2">
                                        <Icon name="RefreshCw" className="animate-spin text-secondary mx-auto" size={36} />
                                        <p className="text-sm font-medium dark:text-white">Uploading your image...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Icon name="UploadCloud" className="text-slate-400 dark:text-slate-500 mb-3" size={40} />
                                        <p className="text-sm font-semibold dark:text-white mb-1">
                                            Drag & drop your starting frame here, or <span className="text-secondary hover:underline">browse</span>
                                        </p>
                                        <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP up to 50MB</p>
                                    </>
                                )}
                            </div>
                        )}
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Prompt Box */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827]/60 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-200">
                                Motion Prompt <span className="text-red-500">*</span>
                            </label>
                            <button
                                onClick={handleEnhance}
                                disabled={enhancing || !prompt}
                                className="text-xs font-bold text-secondary disabled:opacity-50 hover:bg-secondary/10 px-2.5 py-1 rounded-md transition flex items-center gap-1.5"
                            >
                                {enhancing ? <Icon name="Sparkles" size={12} className="animate-spin" /> : <Icon name="Sparkles" size={12} />}
                                {enhancing ? 'Enhancing...' : 'Magic Enhance'}
                            </button>
                        </div>
                        <textarea
                            className="w-full h-28 bg-slate-50 dark:bg-[#050b14] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none dark:text-white"
                            placeholder="Describe how the person in the image should move (e.g., 'Make her do a slow graceful ramp walk, modeling the outfit, smiling at the camera, highly detailed cinematic lighting')."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />

                        {/* Prompt Optimizer setting */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <Icon name="Info" size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Prompt Optimizer</p>
                                    <p className="text-[10px] text-slate-400">Let Replicate optimize the prompt details</p>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                checked={promptOptimizer}
                                onChange={(e) => setPromptOptimizer(e.target.checked)}
                                className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                            />
                        </div>

                        {/* Subject Reference / Custom Background setting */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <Icon name="Image" size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Custom Background</p>
                                    <p className="text-[10px] text-slate-400">Extract subject and use prompt to change background</p>
                                </div>
                            </div>
                            <input 
                                type="checkbox"
                                checked={useSubjectReference}
                                onChange={(e) => setUseSubjectReference(e.target.checked)}
                                className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating || !image || !prompt}
                        className="w-full py-4 bg-gradient-to-r from-secondary to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {generating ? (
                            <>
                                <Icon name="RefreshCw" size={20} className="animate-spin" />
                                Processing Motion Physics...
                            </>
                        ) : (
                            <>
                                <Icon name="Video" size={20} />
                                Generate Fashion Video
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel: Output Video */}
                <div className="glass-card rounded-2xl p-6 flex flex-col h-full bg-slate-50/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10">
                    <p className="text-xs font-black text-slate-400 tracking-wider uppercase mb-4">Output Preview</p>
                    
                    <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                        
                        {generating ? (
                            <div className="w-full max-w-sm p-6 text-center space-y-6">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon name="Video" className="text-secondary animate-pulse" size={32} />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <span>{statusMessage}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-secondary to-pink-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Video generation typically takes 1-3 minutes. You can monitor the progress bar above.</p>
                            </div>
                        ) : videoUrl ? (
                            <div className="relative w-full h-full flex flex-col justify-between p-4 space-y-4">
                                <div className="flex-1 relative rounded-lg overflow-hidden bg-black flex items-center justify-center">
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        className="max-w-full max-h-[360px] rounded object-contain"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={handleDownload}
                                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <Icon name="Download" size={16} /> Download Runway Video
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setVideoUrl('');
                                            setProgress(0);
                                        }}
                                        className="py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm flex items-center justify-center transition"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-6 text-center max-w-sm space-y-4">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto text-red-500">
                                    <Icon name="AlertCircle" size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white">Generation Failed</h4>
                                    <p className="text-xs text-red-500 break-words">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError('')}
                                    className="px-4 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-white transition"
                                >
                                    Dismiss Error
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-8 text-slate-400 max-w-xs space-y-3">
                                <Icon name="Video" size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
                                <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400">Ready for generation</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Upload an image, input a motion description, and generate your custom 3D fashion runway video.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
