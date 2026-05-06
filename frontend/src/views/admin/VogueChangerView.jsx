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
            glow: 'group-hover:shadow-purple-500/20',
            text: 'text-purple-400',
            badge: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
            iconBg: 'bg-purple-400/10',
            dragBorder: 'border-purple-400 bg-purple-500/10',
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
const ResultCard = ({ label, imageSrc }) => {
    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageSrc;
        a.download = `vogue-changer-${label.toLowerCase()}-${Date.now()}.png`;
        a.click();
    };

    return (
        <div className={`group rounded-3xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden transition-all duration-300 hover:shadow-xl`}>
            <div className="p-3 flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-widest text-cyan-400`}>{label} View</span>
                <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Icon name="Download" size={14} className="text-slate-400" />
                </button>
            </div>
            <img src={imageSrc?.startsWith('http') ? imageSrc : `${BASE_URL}${imageSrc}`} alt={`${label} result`} className="w-full h-80 object-contain bg-black/30 rounded-b-2xl" />
        </div>
    );
};

// ── Main View ─────────────────────────────────────────────────────────
export const VogueChangerView = () => {
    // ── Inputs ──
    const [personImage, setPersonImage] = useState(null);
    const [clothImage, setClothImage] = useState(null);
    const [positivePrompt, setPositivePrompt] = useState('A photo of a girl wearing a plain black t-shirt, outdoors, high quality');
    const [negativePrompt, setNegativePrompt] = useState('blurry, bad quality, distorted, extra limbs, low resolution');
    const [segmentationPrompt, setSegmentationPrompt] = useState('dark blue t-shirt');

    
    // ── Params ──
    const [denoise, setDenoise] = useState(1);
    const [ipadapterWeight, setIpadapterWeight] = useState(1);
    const [steps, setSteps] = useState(20);

    const [cfg, setCfg] = useState(8);
    const [seed, setSeed] = useState(-1);

    // ── Status ──
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState([]);
    const [progress, setProgress] = useState(0);

    const canProcess = personImage && clothImage && !processing;

    const handleProcess = async () => {
        if (!canProcess) return;
        setProcessing(true);
        setResults([]);
        setProgress(5);

        try {
            // 1. Upload Person Image
            setProgress(10);
            const personFormData = new FormData();
            personFormData.append('file', personImage.file);
            const personUploadRes = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: personFormData
            });
            const personData = await personUploadRes.json();
            if (!personUploadRes.ok) throw new Error(personData.error || 'Failed to upload person image');

            // 2. Upload Cloth Image
            setProgress(25);
            const clothFormData = new FormData();
            clothFormData.append('file', clothImage.file);
            const clothUploadRes = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: clothFormData
            });
            const clothData = await clothUploadRes.json();
            if (!clothUploadRes.ok) throw new Error(clothData.error || 'Failed to upload cloth image');

            // 3. Trigger Workflow
            setProgress(40);
            const response = await fetch(`${BASE_URL}/api/comfy/vogue-changer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personImage: personData.url,
                    clothImage: clothData.url,
                    positivePrompt,
                    negativePrompt,
                    segmentationPrompt,
                    denoise,
                    ipadapterWeight,
                    steps,
                    cfg,

                    seed
                })

            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Vogue Changer failed');
            }

            setProgress(90);
            const data = await response.json();
            if (data.images && data.images.length > 0) {
                setResults(data.images);
            } else {
                throw new Error('No output image returned.');
            }
            setProgress(100);
        } catch (error) {
            console.error('Vogue Changer error:', error);
            alert(`Process Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setPersonImage(null);
        setClothImage(null);
        setResults([]);
        setProgress(0);
    };

    return (
        <div className="min-h-screen w-full relative bg-[#071018] overflow-hidden font-sans text-white pb-32">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-10">
                
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
                                Cloth Swap
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                                v2.0 Stable
                            </span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            Vogue Changer
                        </h2>
                    </div>
                    {results.length > 0 && (
                        <button onClick={handleReset} className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-bold transition-all border border-white/10">
                            Reset View
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: Uploads */}
                    <div className="lg:col-span-5 space-y-6">
                        <ImageUploadZone 
                            label="Target Person" 
                            sublabel="Upload Model Image" 
                            icon="User" 
                            value={personImage} 
                            onChange={setPersonImage}
                            accentColor="purple"
                        />
                        <ImageUploadZone 
                            label="Reference Garment" 
                            sublabel="Upload Cloth Image" 
                            icon="ShoppingBag" 
                            value={clothImage} 
                            onChange={setClothImage}
                            accentColor="cyan"
                        />
                    </div>

                    {/* Right: Settings */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Prompts */}
                        <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                                    <Icon name="Type" size={14} /> Positive Prompt
                                </label>
                                <textarea
                                    value={positivePrompt}
                                    onChange={(e) => setPositivePrompt(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#071018]/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:border-cyan-500/50 outline-none resize-none"
                                    placeholder="Describe the final look..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
                                    <Icon name="MinusCircle" size={14} /> Negative Prompt
                                </label>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#071018]/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:border-red-500/50 outline-none resize-none"
                                    placeholder="What to exclude..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                                    <Icon name="Target" size={14} /> Segmentation Target
                                </label>

                                <input
                                    type="text"
                                    value={segmentationPrompt}
                                    onChange={(e) => setSegmentationPrompt(e.target.value)}
                                    className="w-full bg-[#071018]/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:border-purple-500/50 outline-none"
                                    placeholder="What to replace? (e.g. t-shirt, pants)"
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-[#111F2D]/60 backdrop-blur-xl rounded-3xl border border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Denoise / Noise */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Noise (Denoise)</span>
                                    <input 
                                        type="number" min="0" max="1" step="0.01"
                                        value={denoise} onChange={(e) => setDenoise(parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20 outline-none text-center focus:border-cyan-400"
                                    />
                                </div>

                                <input 
                                    type="range" min="0" max="1" step="0.01" 
                                    value={denoise} onChange={(e) => setDenoise(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-400 h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                    <span>Preserve Original</span><span>Creative Fusion</span>
                                </div>
                            </div>

                            {/* IPAdapter Weight */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">IPAdapter Weight</span>
                                    <input 
                                        type="number" min="0" max="2" step="0.01"
                                        value={ipadapterWeight} onChange={(e) => setIpadapterWeight(parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/20 outline-none text-center focus:border-yellow-400"
                                    />
                                </div>

                                <input 
                                    type="range" min="0" max="1.5" step="0.05" 
                                    value={ipadapterWeight} onChange={(e) => setIpadapterWeight(parseFloat(e.target.value))}
                                    className="w-full accent-yellow-400 h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                    <span>Subtle</span><span>Strong Style</span>
                                </div>
                            </div>

                            {/* Steps */}

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Sampling Steps</span>
                                    <input 
                                        type="number" min="1" max="100" step="1"
                                        value={steps} onChange={(e) => setSteps(parseInt(e.target.value) || 1)}
                                        className="w-16 bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded border border-purple-400/20 outline-none text-center focus:border-purple-400"
                                    />
                                </div>

                                <input 
                                    type="range" min="1" max="50" step="1" 
                                    value={steps} onChange={(e) => setSteps(parseInt(e.target.value))}
                                    className="w-full accent-purple-400 h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            {/* CFG */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">CFG Scale</span>
                                    <input 
                                        type="number" min="1" max="30" step="0.5"
                                        value={cfg} onChange={(e) => setCfg(parseFloat(e.target.value) || 1)}
                                        className="w-16 bg-white/5 text-slate-200 px-2 py-0.5 rounded border border-white/10 outline-none text-center focus:border-white/30"
                                    />
                                </div>

                                <input 
                                    type="range" min="1" max="20" step="0.5" 
                                    value={cfg} onChange={(e) => setCfg(parseFloat(e.target.value))}
                                    className="w-full accent-white h-1.5 bg-[#071018] rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Seed */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Seed</span>
                                    <button onClick={() => setSeed(-1)} className="text-[8px] text-cyan-400 hover:underline">RANDOMIZE</button>
                                </div>
                                <input 
                                    type="number" 
                                    value={seed} 
                                    onChange={(e) => setSeed(parseInt(e.target.value))}
                                    className="w-full bg-[#071018] border border-white/10 rounded-xl p-2 text-xs text-center outline-none focus:border-cyan-500/50"
                                    placeholder="-1 for random"
                                />
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={handleProcess}
                            disabled={!canProcess}
                            className={`w-full py-6 rounded-[32px] font-black text-2xl tracking-tighter transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl
                                ${canProcess 
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98]' 
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' }`}
                        >
                            {processing ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing Neural Swap...
                                </>
                            ) : (
                                <>
                                    Start Vogue Engine
                                    <Icon name="ArrowRight" size={24} />
                                </>
                            )}
                        </button>

                        {processing && (
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 animate-pulse">
                                    Rendering Canvas ({progress}%)
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {results.length > 0 && (
                    <div className="pt-10 space-y-8 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                            <h3 className="text-2xl font-black tracking-tight uppercase italic">Generation Result</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {results.map((img, i) => (
                                <ResultCard key={i} label={`Output ${i+1}`} imageSrc={img} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
