import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon';

export const TwoDToThreeDView = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [modelUrls, setModelUrls] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Inject model-viewer script dynamically
    useEffect(() => {
        if (!customElements.get('model-viewer')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
            document.head.appendChild(script);
        }
    }, []);

    // Polling mechanism
    useEffect(() => {
        let interval;
        if (taskId && isGenerating) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/meshy/task/${taskId}`);
                    const json = await res.json();

                    if (json.success && json.data) {
                        const status = json.data.status;
                        setProgress(json.data.progress || 0);

                        if (status === 'SUCCEEDED') {
                            setIsGenerating(false);
                            setModelUrls(json.data.model_urls);
                            clearInterval(interval);
                        } else if (status === 'FAILED') {
                            setIsGenerating(false);
                            setError(json.data.task_error?.message || 'Generation failed');
                            clearInterval(interval);
                        }
                    } else {
                         setError(json.error || 'Failed to fetch status');
                         setIsGenerating(false);
                         clearInterval(interval);
                    }
                } catch (err) {
                    setError('Network error while checking status');
                    setIsGenerating(false);
                    clearInterval(interval);
                }
            }, 5000); // Check every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [taskId, isGenerating]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setModelUrls(null);
            setError('');
            setProgress(0);
            setTaskId(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedImage) {
            setError('Please select an image first.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setProgress(0);
        setModelUrls(null);
        setTaskId(null);

        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onloadend = async () => {
            const base64data = reader.result;
            try {
                const res = await fetch('/api/meshy/image-to-3d', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: base64data })
                });

                const data = await res.json();
                if (data.success && data.result) {
                    setTaskId(data.result);
                } else {
                    setError(data.error || 'Failed to start generation');
                    setIsGenerating(false);
                }
            } catch (err) {
                setError('Failed to connect to the server');
                setIsGenerating(false);
            }
        };
    };

    return (
        <div className="h-full flex flex-col p-6 animate-fade-in relative overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Icon name="Cube" size={32} className="text-cyan-400" />
                        2D to 3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Generator</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium">
                        Transform standard 2D images into fully textured 3D models using Meshy AI.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
                {/* Left Column: Input */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                    
                    <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                        <Icon name="Image" size={20} className="text-cyan-400" /> Input Image
                    </h2>

                    <div 
                        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group
                            ${previewUrl ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 hover:border-cyan-500/50 hover:bg-white/5'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                        ) : (
                            <div className="text-center p-6 transform transition-transform group-hover:scale-105">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                                    <Icon name="Upload" size={28} className="text-slate-400 group-hover:text-cyan-400" />
                                </div>
                                <p className="text-slate-300 font-bold mb-1">Click to Upload Image</p>
                                <p className="text-slate-500 text-xs">JPG, PNG up to 10MB</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                            <Icon name="AlertCircle" size={16} />
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !selectedImage}
                        className={`mt-4 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2
                            ${(isGenerating || !selectedImage) 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'}`}
                    >
                        {isGenerating ? (
                            <>
                                <Icon name="Loader" size={18} className="animate-spin" />
                                Generating ({progress}%)
                            </>
                        ) : (
                            <>
                                <Icon name="Wand2" size={18} />
                                Generate 3D Model
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Output */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/5 to-transparent pointer-events-none" />
                    
                    <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                        <Icon name="Box" size={20} className="text-blue-400" /> 3D Output
                    </h2>

                    <div className="flex-1 bg-black/50 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        {isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                                <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-cyan-400 font-bold tracking-widest uppercase">Meshy AI Processing...</p>
                                <div className="w-48 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}
                        
                        {modelUrls ? (
                            <div className="w-full h-full relative group flex flex-col items-center justify-center p-2">
                                <model-viewer
                                    src={modelUrls.glb?.replace('https://assets.meshy.ai', '/meshy-proxy')}
                                    auto-rotate
                                    camera-controls
                                    style={{ width: '100%', height: '100%', minHeight: '400px' }}
                                ></model-viewer>
                                
                                {/* Download Options - shown on hover */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-wrap justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                    {modelUrls.glb && (
                                        <a 
                                            href={modelUrls.glb} 
                                            download 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-black/80 hover:bg-cyan-500/20 border border-white/10 text-white p-2 px-4 rounded-xl flex items-center gap-2 backdrop-blur-md transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
                                        >
                                            <Icon name="Download" size={14} /> GLB
                                        </a>
                                    )}
                                    {modelUrls.gltf && (
                                        <a 
                                            href={modelUrls.gltf} 
                                            download 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-black/80 hover:bg-cyan-500/20 border border-white/10 text-white p-2 px-4 rounded-xl flex items-center gap-2 backdrop-blur-md transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
                                        >
                                            <Icon name="Download" size={14} /> GLTF
                                        </a>
                                    )}
                                    {modelUrls.obj && (
                                        <a 
                                            href={modelUrls.obj} 
                                            download 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-black/80 hover:bg-cyan-500/20 border border-white/10 text-white p-2 px-4 rounded-xl flex items-center gap-2 backdrop-blur-md transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
                                        >
                                            <Icon name="Download" size={14} /> OBJ
                                        </a>
                                    )}
                                    {modelUrls.fbx && (
                                        <a 
                                            href={modelUrls.fbx} 
                                            download 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-black/80 hover:bg-cyan-500/20 border border-white/10 text-white p-2 px-4 rounded-xl flex items-center gap-2 backdrop-blur-md transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
                                        >
                                            <Icon name="Download" size={14} /> FBX
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : !isGenerating ? (
                            <div className="text-center p-8 opacity-50">
                                <Icon name="Box" size={64} className="mx-auto mb-4 text-slate-600" />
                                <p className="text-slate-400 font-medium tracking-wide">Your 3D model will appear here</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
