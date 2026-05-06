import { useState, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { BASE_URL } from '../../services/api';

// ── Image Upload Zone ──────────────────────────────────────────────────
const ImageUploadZone = ({ label, sublabel, icon, value, onChange, accentColor = 'cyan' }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const colorMap = {
        cyan: {
            border: 'border-cyan-400/40 hover:border-cyan-400',
            bg: 'hover:bg-cyan-500/5',
            glow: 'group-hover:shadow-cyan-500/20',
            text: 'text-cyan-400',
            badge: 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400',
            iconBg: 'bg-cyan-400/10',
            dragBorder: 'border-cyan-400 bg-cyan-500/10',
        },
        purple: {
            border: 'border-purple-400/40 hover:border-purple-400',
            bg: 'hover:bg-purple-500/5',
            glow: 'group-hover:shadow-#38506A]/20',
            text: 'text-[#38506A]',
            badge: 'bg-purple-400/10 border-purple-400/20 text-[#38506A]',
            iconBg: 'bg-purple-400/10',
            dragBorder: 'border-purple-400 bg-purple-500/10',
        },
        pink: {
            border: 'border-pink-400/40 hover:border-pink-400',
            bg: 'hover:bg-[#38506A]/5',
            glow: 'group-hover:shadow-#38506A]/20',
            text: 'text-[#38506A]',
            badge: 'bg-pink-400/10 border-pink-400/20 text-[#38506A]',
            iconBg: 'bg-pink-400/10',
            dragBorder: 'border-pink-400 bg-[#38506A]/10',
        }
    };
    const c = colorMap[accentColor] || colorMap.cyan;

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

            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.badge}`}>
                {label}
            </div>

            {value?.url ? (
                <div className="relative">
                    <img
                        src={value.url}
                        alt={label}
                        className="w-full h-72 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <div className={`flex items-center gap-2 ${c.text} font-bold text-sm`}>
                            <Icon name="Upload" size={18} /> Change Image
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-72 gap-3 p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
                        <Icon name={icon} size={32} className={`${c.text} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${c.text}`}>{sublabel}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Drag & drop or click to upload</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Result Card ───────────────────────────────────────────────────────
const ResultCard = ({ label, imageSrc, accentColor = 'pink' }) => {
    
    const colorMap = {
        cyan: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
        purple: 'text-[#38506A] border-purple-400/20 bg-purple-400/5',
        pink: 'text-[#38506A] border-pink-400/20 bg-pink-400/5',
    };
    
    const textColors = {
        cyan: 'text-cyan-400',
        purple: 'text-[#38506A]',
        pink: 'text-[#38506A]'
    };

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageSrc;
        a.download = `meta-vouge-${label.toLowerCase()}-${Date.now()}.png`;
        a.click();
    };

    return (
        <div className={`group rounded-3xl border overflow-hidden ${colorMap[accentColor]} transition-all duration-300 hover:shadow-xl`}>
            <div className="p-3 flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-widest ${textColors[accentColor]}`}>{label} View</span>
                <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Icon name="Download" size={14} className="text-slate-400" />
                </button>
            </div>
            <img src={imageSrc?.startsWith('http') ? imageSrc : `${BASE_URL}${imageSrc}`} alt={`${label} result`} className="w-full h-[500px] object-contain bg-black/30 rounded-b-2xl" />
        </div>
    );
};

// ── Main View ─────────────────────────────────────────────────────────
export const MetaVogueIMView = () => {
    // ── Inputs ──
    const [baseImage, setBaseImage] = useState(null);
    const [outfitPrompt, setOutfitPrompt] = useState('elegant red silk dress, highly detailed fabric, fashion photography');
    const [backgroundPrompt, setBackgroundPrompt] = useState('change background into studio');
    const [facePrompt, setFacePrompt] = useState('sad');
    const [negativePrompt, setNegativePrompt] = useState('blurry, bad quality, distorted, extra limbs, low resolution');
    const [outputType, setOutputType] = useState('outfit'); // 'outfit' or 'face'
    
    // ── Params ──
    const [steps, setSteps] = useState(20);
    const [cfg, setCfg] = useState(8);
    const [ipadapterWeight, setIpadapterWeight] = useState(0.0);
    const [seed, setSeed] = useState(-1);

    // ── Status State ─────────────────────────────────────────────────
    const [processing, setProcessing] = useState(false);
    const [images, setImages] = useState([]); 
    const [progress, setProgress] = useState(0);

    const canProcess = baseImage && outfitPrompt.trim() && !processing;

    const handleProcess = async () => {
        if (!canProcess) return;
        setProcessing(true);
        setImages([]); 
        setProgress(10);

        try {
            setProgress(20);

            // Upload Image
            const formData = new FormData();
            formData.append('file', baseImage.file);
            const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Failed to upload base image');
            const uploadData = await uploadRes.json();
            const uploadedImageUrl = uploadData.url;

            setProgress(40);
            
            const response = await fetch(`${BASE_URL}/api/comfy/meta-vogue-im`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    baseImage: uploadedImageUrl,
                    outfitPrompt,
                    backgroundPrompt,
                    facePrompt,
                    negativePrompt,
                    outputType,
                    ipadapterWeight,
                    steps,
                    cfg,
                    seed: seed === -1 ? -1 : parseInt(seed)
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to generate output');
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
        setBaseImage(null);
        setImages([]);
        setProgress(0);
    };

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
                                Output Variants
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[#111F2D] border border-[#28394B] text-[#38506A] text-[10px] font-bold tracking-wider uppercase">
                                Meta Vogue Engine
                            </span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#38506A] via-slate-200 to-[#38506A]">
                            Meta Vogue IM
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

                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Reference Input */}
                        <div className="lg:col-span-1 space-y-6">
                            <ImageUploadZone 
                                label="Base Image" 
                                sublabel="Original Photo" 
                                icon="Image" 
                                value={baseImage} 
                                onChange={setBaseImage}
                                accentColor="cyan"
                            />
                            
                            {/* Output Selector */}
                            <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6">
                                <label className="text-[10px] font-black uppercase text-[#38506A] tracking-widest flex items-center gap-2 mb-4">
                                    <Icon name="Layers" size={14} /> Output Variant
                                </label>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setOutputType('outfit')}
                                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${outputType === 'outfit' ? 'bg-#38506A]/20 border-[#38506A] text-white' : 'bg-[#071018]/50 border-[#28394B] text-slate-400 hover:border-[#38506A]/50'}`}
                                    >
                                        Outfit & Background Only
                                    </button>
                                    <button 
                                        onClick={() => setOutputType('face')}
                                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${outputType === 'face' ? 'bg-#38506A]/20 border-[#38506A] text-white' : 'bg-[#071018]/50 border-[#28394B] text-slate-400 hover:border-[#38506A]/50'}`}
                                    >
                                        Facial Details Enhanced
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Prompts Section */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Outfit & Style Prompt */}
                            <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 transition-all duration-500 hover:border-[#38506A]/50">
                                <label className="text-[10px] font-black uppercase text-[#38506A] tracking-widest flex items-center gap-2">
                                    <Icon name="Shirt" size={14} /> Outfit & Style Vision
                                </label>
                                <textarea
                                    value={outfitPrompt}
                                    onChange={(e) => setOutfitPrompt(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 focus:text-white focus:border-[#38506A] focus:ring-1 focus:ring-[#38506A]/50 outline-none resize-none transition-all placeholder-slate-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Face Prompt */}
                                <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 transition-all duration-500 hover:border-[#38506A]/50">
                                    <label className="text-[10px] font-black uppercase text-[#38506A] tracking-widest flex items-center gap-2">
                                        <Icon name="Smile" size={14} /> Facial Expression
                                    </label>
                                    <textarea
                                        value={facePrompt}
                                        onChange={(e) => setFacePrompt(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 focus:text-white focus:border-[#38506A] focus:ring-1 focus:ring-[#38506A]/50 outline-none resize-none transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* Background Prompt */}
                                <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 transition-all duration-500 hover:border-[#38506A]">
                                    <label className="text-[10px] font-black uppercase text-[#38506A] tracking-widest flex items-center gap-2">
                                        <Icon name="Image" size={14} /> Background Adaptation
                                    </label>
                                    <textarea
                                        value={backgroundPrompt}
                                        onChange={(e) => setBackgroundPrompt(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 focus:text-white focus:border-[#38506A] focus:ring-1 focus:ring-[#38506A]/50 outline-none resize-none transition-all placeholder-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Negative Prompt */}
                            <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-[#28394B] shadow-xl p-6 space-y-4 transition-all duration-500 hover:border-red-900/40">
                                <label className="text-[10px] font-black uppercase text-red-700 tracking-widest flex items-center gap-2">
                                    <Icon name="MinusCircle" size={14} /> Negative Constraints
                                </label>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#071018]/50 border border-[#28394B] rounded-2xl p-4 text-sm text-slate-300 outline-none resize-none focus:border-red-900/40 transition-all placeholder-slate-500"
                                />
                            </div>
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
                                type="range" min="1" max="50" step="1" 
                                value={steps} onChange={(e) => setSteps(e.target.value)}
                                className="w-full accent-[#38506A] h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        {/* CFG Scale */}
                        <div className="space-y-3 relative group/cfg">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">CFG Scale</span>
                                <span className="text-[#38506A] bg-[#1C2B38] px-2 py-0.5 rounded-lg border border-[#28394B]">{cfg}</span>
                            </div>
                            <input 
                                type="range" min="1" max="15" step="0.5" 
                                value={cfg} onChange={(e) => setCfg(e.target.value)}
                                className="w-full accent-slate-400 h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        {/* IPAdapter Weight */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">IP Weight</span>
                                <span className="text-[#38506A] bg-[#1C2B38] px-2 py-0.5 rounded-lg border border-[#28394B]">{ipadapterWeight}</span>
                            </div>
                            <input 
                                type="range" min="0" max="2" step="0.05" 
                                value={ipadapterWeight} onChange={(e) => setIpadapterWeight(e.target.value)}
                                className="w-full accent-[#38506A] h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                            />
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
                                    ? 'bg-gradient-to-r from-[#38506A] via-[#28394B] to-[#1C2B38] text-white shadow-[0_25px_80px_-20px_rgba(56,80,106,0.6)] hover:scale-105 active:scale-95' 
                                    : 'bg-[#111F2D] text-slate-600 cursor-not-allowed opacity-50 border border-[#28394B]' }
                                flex items-center gap-4`}
                        >
                            {processing ? (
                                <>
                                    <div className="w-7 h-7 border-[4px] border-white border-t-transparent rounded-full animate-spin" />
                                    Processing Engine...
                                </>
                            ) : (
                                <>
                                    Render Sequence
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
                                    Neural Extraction in Progress ({progress}%)
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
                                        <h3 className="text-2xl font-black tracking-tight">Rendered Output</h3>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 max-w-3xl mx-auto gap-8">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="animate-fade-in-up">
                                            <ResultCard 
                                                label={outputType === 'outfit' ? 'Outfit & Background' : 'Facial Details Enhanced'} 
                                                imageSrc={img} 
                                                accentColor="cyan" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : !processing && (
                            <div className="flex flex-col items-center justify-center py-32 bg-[#111F2D]/20 rounded-[60px] border border-dashed border-[#28394B] group grayscale opacity-30">
                                <Icon name="Layers" size={80} className="mb-6 text-slate-700" />
                                <h4 className="text-2xl font-black text-slate-700">Awaiting Extraction</h4>
                                <p className="text-slate-800 text-sm mt-2 font-bold tracking-widest uppercase">Select variant & render</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
