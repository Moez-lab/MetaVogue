import { useState, useRef } from 'react';
import { Icon } from '../../components/Icon';

// ── Image Upload Zone ──────────────────────────────────────────────────
const ImageUploadZone = ({ label, sublabel, icon, value, onChange, accentColor = 'yellow' }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const colorMap = {
        yellow: {
            border: 'border-yellow-400/40 hover:border-yellow-400',
            bg: 'hover:bg-yellow-500/5',
            glow: 'group-hover:shadow-yellow-500/20',
            text: 'text-yellow-400',
            badge: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
            iconBg: 'bg-yellow-400/10',
            dragBorder: 'border-yellow-400 bg-yellow-500/10',
        },
        lime: {
            border: 'border-lime-400/40 hover:border-lime-400',
            bg: 'hover:bg-lime-500/5',
            glow: 'group-hover:shadow-lime-500/20',
            text: 'text-lime-400',
            badge: 'bg-lime-400/10 border-lime-400/20 text-lime-400',
            iconBg: 'bg-lime-400/10',
            dragBorder: 'border-lime-400 bg-lime-500/10',
        },
    };
    const c = colorMap[accentColor];

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            onChange({ file, url });
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange({ file, url });
        }
    };

    return (
        <div
            className={`group relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                ${dragging ? c.dragBorder : `${c.border} ${c.bg}`}
                shadow-lg ${c.glow} hover:shadow-xl`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
        >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {/* Corner badge */}
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.badge}`}>
                {label}
            </div>

            {value?.url ? (
                <div className="relative">
                    <img
                        src={value.url}
                        alt={label}
                        className="w-full h-56 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <div className={`flex items-center gap-2 ${c.text} font-bold text-sm`}>
                            <Icon name="Upload" size={18} /> Change Image
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-56 gap-3 p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
                        <Icon name={icon} size={32} className={`${c.text} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${c.text}`}>{sublabel}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Drag & drop or click to upload</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>PNG</span><span>·</span><span>JPG</span><span>·</span><span>WEBP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Result Card ───────────────────────────────────────────────────────
const ResultCard = ({ label, imageSrc, accentColor = 'yellow' }) => {
    const colorMap = {
        yellow: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
        lime: 'text-lime-400 border-lime-400/20 bg-lime-400/5',
    };

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageSrc;
        a.download = `image-generator-${label.toLowerCase()}-${Date.now()}.png`;
        a.click();
    };

    return (
        <div className={`group rounded-3xl border overflow-hidden ${colorMap[accentColor]} transition-all duration-300 hover:shadow-xl`}>
            <div className="p-3 flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-widest ${accentColor === 'yellow' ? 'text-yellow-400' : 'text-lime-400'}`}>{label} View</span>
                <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Icon name="Download" size={14} className="text-slate-400" />
                </button>
            </div>
            <img src={imageSrc} alt={`${label} result`} className="w-full h-64 object-contain bg-black/30 rounded-b-2xl" />
        </div>
    );
};

// ── Main View ─────────────────────────────────────────────────────────
export const NanoBananaView = () => {
    // ── Basic State ──────────────────────────────────────────────────
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('blurry, bad quality, distorted, extra limbs, low resolution');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    
    // ── Advanced Parameters ──────────────────────────────────────────
    const [steps, setSteps] = useState(8);
    const [cfg, setCfg] = useState(1.5);
    const [batchSize, setBatchSize] = useState(1);
    const [seed, setSeed] = useState(-1); // -1 means random
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ── Status State ─────────────────────────────────────────────────
    const [processing, setProcessing] = useState(false);
    const [images, setImages] = useState([]); 
    const [progress, setProgress] = useState(0);

    const canProcess = (prompt.trim() || frontImage || backImage) && !processing;

    const handleProcess = async () => {
        if (!canProcess) return;
        setProcessing(true);
        setImages([]); 
        setProgress(10);

        try {
            setProgress(20);
            const response = await fetch('http://localhost:3001/api/comfy/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt, 
                    negativePrompt,
                    steps,
                    cfg,
                    batchSize,
                    seed: seed === -1 ? -1 : parseInt(seed)
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to generate images');
            }

            setProgress(80);
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                setImages(data.images);
            } else {
                throw new Error('No images returned from engine.');
            }
            
            setProgress(100);
        } catch (error) {
            console.error('Process error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setPrompt('');
        setFrontImage(null);
        setBackImage(null);
        setImages([]);
        setProgress(0);
    };

    const quickTags = ['High Detail', 'Photorealistic', 'Transparent BG', 'Studio Lit', 'Wireframe', 'Clay Render', '8k Resolution', 'Unreal Engine 5'];

    return (
        <div className="min-h-screen w-full relative bg-[#071018] overflow-hidden font-sans text-white selection:bg-[#38506A]/30 transition-colors duration-500">

            {/* Ambient glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-[#38506A]/10 rounded-full blur-[180px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#28394B]/10 rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8 pb-32">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-[#1C2B38] border border-[#28394B] text-[#38506A] text-[10px] font-black tracking-widest uppercase">
                                PRO v0.3
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[#111F2D] border border-[#28394B] text-[#38506A] text-[10px] font-bold tracking-wider uppercase">
                                Turbo Engine
                            </span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#38506A] via-slate-200 to-[#38506A]">
                            Image Generator
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {images.length > 0 && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#111F2D] hover:bg-[#1C2B38] text-slate-400 text-sm font-bold transition-all border border-[#28394B] shadow-sm"
                            >
                                <Icon name="RefreshCw" size={16} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Main Input Grid ── */}
                <div className="space-y-8">
                    
                    {/* Prompts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Positive Prompt */}
                        <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 group transition-all duration-500 hover:border-[#38506A]">
                            <label className="text-[10px] font-black uppercase text-[#38506A] tracking-widest flex items-center gap-2">
                                <Icon name="Zap" size={14} className="fill-current" /> Positive Vision
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 focus:text-white focus:border-[#38506A] focus:ring-1 focus:ring-[#38506A]/50 outline-none resize-none transition-all placeholder-slate-500"
                                placeholder="Describe the garment details, fabric, lighting..."
                            />
                        </div>

                        {/* Negative Prompt */}
                        <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 transition-all duration-500 hover:border-red-900/40">
                            <label className="text-[10px] font-black uppercase text-red-700 tracking-widest flex items-center gap-2">
                                <Icon name="MinusCircle" size={14} /> Negative Constraints
                            </label>
                            <textarea
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                rows={4}
                                className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 outline-none resize-none focus:border-red-900/40 transition-all placeholder-slate-500"
                                placeholder="What to exclude (e.g. blurry, low quality)..."
                            />
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-[40px] border border-[#28394B] shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        
                        {/* Steps */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Steps</span>
                                <span className="text-[#38506A] bg-[#1C2B38] px-2 py-0.5 rounded-lg border border-[#28394B]">{steps}</span>
                            </div>
                            <input 
                                type="range" min="1" max="25" step="1" 
                                value={steps} onChange={(e) => setSteps(e.target.value)}
                                className="w-full accent-[#38506A] h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                                <span>FAST</span><span>HD</span>
                            </div>
                        </div>

                        {/* CFG Scale */}
                        <div className="space-y-3 relative group/cfg">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">CFG Scale</span>
                                    <div className="relative inline-flex items-center group/tooltip">
                                        <div className="w-5 h-5 rounded-full bg-[#38506A] flex items-center justify-center text-[10px] text-white cursor-help shadow-[0_0_10px_rgba(56,80,106,0.4)] hover:bg-slate-200 hover:text-[#071018] transition-all duration-300 z-10">
                                            !
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 z-50">
                                            <div className="bg-[#111F2D] border border-[#28394B] p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-[11px] space-y-3 leading-relaxed normal-case font-medium text-slate-300 border-t-[#38506A]/50">
                                                <p className="text-[#38506A] font-black uppercase tracking-tighter border-b border-[#28394B] pb-2 text-[12px]">CFG Precision Guidance</p>
                                                <p><span className="text-blue-400 font-bold">Low (1.0 - 4.0):</span> Loose suggestion. Artistic & natural, but might ignore details.</p>
                                                <p><span className="text-emerald-400 font-bold">Sweet Spot (6.0 - 8.0):</span> Follows instructions well with natural textures.</p>
                                                <p><span className="text-red-400 font-bold">High (12.0+):</span> "Deep-fried" look. Over-saturated, harsh, or glitchy.</p>
                                                <div className="pt-2 mt-2 border-t border-[#28394B] text-[10px] text-slate-500 italic">
                                                    Standard Range: Low (1-15), Sweet Spot (20-30), Too Many (40+).
                                                </div>
                                            </div>
                                            <div className="w-4 h-4 bg-[#111F2D] border-r border-b border-[#28394B] rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-slate-200 bg-[#1C2B38] px-2 py-0.5 rounded-lg border border-[#28394B]">{cfg}</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="5" step="0.1" 
                                value={cfg} onChange={(e) => setCfg(e.target.value)}
                                className="w-full accent-slate-400 h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                                <span>CREATIVE</span><span>STRICT</span>
                            </div>
                        </div>

                        {/* Batch Size */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Outputs</span>
                                <span className="text-[#38506A] bg-[#1C2B38] px-2 py-0.5 rounded-lg border border-[#28394B]">{batchSize}</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setBatchSize(num)}
                                        className={`flex-1 py-1.5 rounded-xl border-2 transition-all font-black text-sm ${
                                            batchSize == num 
                                            ? 'bg-[#38506A]/20 border-[#38506A] text-white' 
                                            : 'bg-[#071018] border-[#28394B] text-slate-500 hover:border-[#38506A]'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seed */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Seed</span>
                                <button onClick={() => setSeed(-1)} className="text-[9px] text-[#38506A] hover:text-[#38506A]/80 transition-colors">RANDOMIZE</button>
                            </div>
                            <input 
                                type="number" 
                                value={seed} 
                                onChange={(e) => setSeed(e.target.value)}
                                className="w-full bg-[#071018] border border-[#28394B] rounded-xl p-2.5 text-xs text-center font-mono outline-none focus:border-[#38506A]"
                                placeholder="-1 for random"
                            />
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={handleProcess}
                            disabled={!canProcess}
                            className={`group relative px-20 py-6 rounded-[32px] font-black text-2xl tracking-tighter transition-all duration-500
                                ${canProcess 
                                    ? 'bg-gradient-to-br from-[#38506A] via-[#28394B] to-[#1C2B38] text-white shadow-[0_25px_80px_-20px_rgba(56,80,106,0.6)] hover:scale-105 active:scale-95 border border-[#38506A]/30' 
                                    : 'bg-[#111F2D] text-slate-600 cursor-not-allowed opacity-50 border border-[#28394B]' }
                                flex items-center gap-4`}
                        >
                            {processing ? (
                                <>
                                    <div className="w-7 h-7 border-[4px] border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Inference Engine
                                    <Icon name="ArrowRight" size={28} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>

                        {processing && (
                            <div className="w-full max-w-xl space-y-3 animate-fade-in">
                                <div className="h-4 w-full bg-[#071018] rounded-full overflow-hidden p-1 border border-[#28394B]">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#38506A] via-slate-400 to-[#38506A] rounded-full animate-pulse transition-all duration-700"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-center text-[10px] uppercase font-black tracking-[0.2em] text-[#38506A] animate-pulse">
                                    Neural Processing in Progress ({progress}%)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Results Display */}
                    <div className="pt-8">
                        {images.length > 0 ? (
                            <div className="space-y-8 animate-fade-in">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-[#38506A] rounded-full animate-ping" />
                                        <h3 className="text-2xl font-black tracking-tight">Generated Variants</h3>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#111F2D] px-4 py-1.5 rounded-full border border-[#28394B]">
                                        Rendered via ComfyUI-Turbo · {images.length} Results
                                    </div>
                                </div>
                                
                                <div className={`grid gap-8 ${
                                    images.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 
                                    images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'
                                }`}>
                                    {images.map((img, idx) => (
                                        <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                                            <ResultCard label={`Concept ${idx + 1}`} imageSrc={img} accentColor="blue" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : !processing && (
                            <div className="flex flex-col items-center justify-center py-32 bg-[#111F2D]/20 rounded-[60px] border border-dashed border-[#28394B] group grayscale opacity-30">
                                <Icon name="Image" size={80} className="mb-6 text-slate-700" />
                                <h4 className="text-2xl font-black text-slate-700">Awaiting Concept Creation</h4>
                                <p className="text-slate-800 text-sm mt-2 font-bold tracking-widest uppercase">Select parameters & run engine</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footnote */}
                <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span>METAVOGUE CORE 2.0</span>
                        <span>·</span>
                        <span className="text-[#38506A]">GPU ACCELERATED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icon name="Info" size={12} />
                        Outputs are licensed under research usage terms.
                    </div>
                </div>

            </div>
        </div>
    );
};
