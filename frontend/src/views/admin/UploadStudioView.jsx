import { useState } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { UploadZone } from '../../components/UploadZone';
import { meshyService } from '../../services/meshy';
import { ModelViewer } from '../../components/ModelViewer';

// Utility to convert data URL to File object
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export const UploadStudioView = () => {
    const { setShirtImage, updateProjectAsset } = useGlobal();
    const [image, setImage] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const checkStatus = async (id) => {
        try {
            const task = await meshyService.getImageTo3DTask(id);
            console.log("Task status:", task.status, task.progress);

            if (task.status === 'SUCCEEDED') {
                setScanning(false);
                setResult(task);
                setProgress(100);

                // Update Active Project
                updateProjectAsset('garment', task.model_urls.glb, 'Uploaded Garment');

            } else if (task.status === 'FAILED') {
                setScanning(false);
                setError(task.message || 'Generation failed');
            } else {
                setProgress(task.progress || 0);
                setTimeout(() => checkStatus(id), 2000);
            }
        } catch (err) {
            console.error(err);
            setScanning(false);
            setError('Failed to check status');
        }
    };

    const handleFileSelect = (file) => {
        setError(null);
        setResult(null);
        setTaskId(null);

        // Create local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
            setShirtImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const startGeneration = async () => {
        if (!image) return;

        setScanning(true);
        setProgress(0);
        setError(null);

        try {
            // Start Meshy AI task
            const response = await meshyService.createImageTo3D(image);
            setTaskId(response.result);
            // Start polling
            checkStatus(response.result);
        } catch (err) {
            console.error(err);
            setScanning(false);
            setError(err.message || 'Failed to start generation');
        }
    };

    const handleRemove = () => {
        setImage(null);
        setShirtImage(null);
        setResult(null);
        setTaskId(null);
        setError(null);
        setScanning(false);
    };

    const getDownloadUrls = () => {
        if (!result?.model_urls) return {};
        return {
            fbx: result.model_urls.fbx,
            glb: result.model_urls.glb,
            obj: result.model_urls.obj
        };
    };

    const urls = getDownloadUrls();

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

            <div className="relative z-10 p-8 max-w-7xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-wider uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            System Ready
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-gray-200 dark:to-gray-500">
                            Virtual Wardrobe
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg">
                            Digitize your physical garments for <span className="text-cyan-600 dark:text-cyan-400 font-bold">neural simulation</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Upload Area */}
                        <div className="md:col-span-2">
                            <div className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl p-1 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden group transition-colors duration-500">
                                {/* Inner Container */}
                                <div className="bg-white dark:bg-[#0a0f18] rounded-[22px] p-8 relative overflow-hidden transition-colors duration-500">

                                    {scanning ? (
                                        <div className="h-80 flex flex-col items-center justify-center relative">
                                            <div className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">Generating 3D Model...</h3>
                                            <p className="text-cyan-600 dark:text-cyan-400 font-mono text-sm mb-4">PROGRESS: {progress}%</p>

                                            <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cyan-500 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>

                                            {/* Scanning Grid Effect */}
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                                        </div>
                                    ) : result && typeof urls.glb === 'string' ? (
                                        <div className="relative h-80 group/preview rounded-2xl overflow-hidden border border-emerald-500/30">
                                            <ModelViewer url={urls.glb} />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                <Icon name="CheckCircle" size={14} />
                                                GENERATION COMPLETE
                                            </div>

                                            {/* Actions */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-none">
                                                <div className="pointer-events-auto flex gap-2 w-full justify-end">
                                                    {urls.fbx && (
                                                        <a
                                                            href={urls.fbx}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                                        >
                                                            <Icon name="Download" size={16} /> FBX
                                                        </a>
                                                    )}
                                                    {urls.glb && (
                                                        <a
                                                            href={urls.glb}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                                        >
                                                            <Icon name="Download" size={16} /> GLB
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={handleRemove}
                                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                                    >
                                                        <Icon name="Trash" size={16} /> Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : image ? (
                                        <div className="relative h-80 group/preview rounded-2xl overflow-hidden border border-emerald-500/30">
                                            <img src={image} alt="Uploaded Shirt" className="w-full h-full object-contain bg-slate-50 dark:bg-[#050b14]" />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 dark:from-[#050b14] via-transparent to-transparent opacity-80"></div>

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                <Icon name="CheckCircle" size={14} />
                                                UPLOADED
                                            </div>

                                            {/* Error Overlay */}
                                            {error && (
                                                <div className="absolute top-16 left-4 right-4 bg-red-500/90 backdrop-blur-md border border-red-500/50 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="AlertCircle" size={16} />
                                                        {error}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-1">ASSET_ID: {taskId || 'PENDING'}</p>
                                                    <p className="text-white font-bold">Imported Garment</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!taskId && !scanning && (
                                                        <button
                                                            onClick={startGeneration}
                                                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                                        >
                                                            <Icon name="Sparkles" size={16} /> Generate 3D
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleRemove}
                                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                                    >
                                                        <Icon name="Trash" size={16} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {error && (
                                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
                                                    {error}
                                                </div>
                                            )}
                                            <UploadZone onFileSelect={handleFileSelect} />
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Protocol Info */}
                        <div className="space-y-6">
                            <div className="bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 transition-colors duration-500">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Icon name="Shield" size={14} /> Protocol Requirements
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Flat Lay Only', desc: 'Ensure garment is placed on a flat surface', valid: true },
                                        { label: 'High Contrast', desc: 'Subject must be distinct from background', valid: true },
                                        { label: 'No Obstructions', desc: 'Remove tags, hangers, or accessories', valid: true },
                                        { label: 'Format', desc: 'PNG or JPG (Max 10MB)', valid: true }
                                    ].map((item, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex gap-3 group hover:bg-white dark:hover:bg-white/10 transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${item.valid ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-gray-200">{item.label}</h4>
                                                <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-600/5 dark:from-cyan-500/10 dark:to-blue-600/10 p-6 rounded-3xl border border-cyan-500/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <Icon name="Info" className="text-cyan-600 dark:text-cyan-400 mb-3" size={24} />
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">AI Processing</h4>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">
                                        Uploaded assets are automatically processed for physics simulation and texture mapping.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
