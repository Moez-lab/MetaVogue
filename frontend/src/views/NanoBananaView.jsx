import { useState, useRef } from 'react';
import { Icon } from '../components/Icon';

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
        a.download = `nano-banana-${label.toLowerCase()}-${Date.now()}.png`;
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
    const [prompt, setPrompt] = useState('');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null); // { front, back }
    const [progress, setProgress] = useState(0);

    const canProcess = prompt.trim() || frontImage || backImage;

    const simulateProcess = async () => {
        if (!canProcess) return;
        setProcessing(true);
        setResults(null);
        setProgress(0);

        // Simulate staged processing
        for (let i = 0; i <= 100; i += 5) {
            await new Promise(r => setTimeout(r, 80));
            setProgress(i);
        }

        // Mock result: use uploaded images as "result" placeholders
        setResults({
            front: frontImage?.url || null,
            back: backImage?.url || null,
        });
        setProcessing(false);
    };

    const handleReset = () => {
        setPrompt('');
        setFrontImage(null);
        setBackImage(null);
        setResults(null);
        setProgress(0);
    };

    const quickTags = ['High Detail', 'Photorealistic', 'Transparent BG', 'Studio Lit', 'Wireframe', 'Clay Render'];

    return (
        <div className="min-h-screen w-full relative bg-slate-50 dark:bg-[#050b14] overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-yellow-500/30 transition-colors duration-500">

            {/* Hex grid background */}
            <div className="hidden dark:block absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0' stroke='%23FACC15' stroke-width='0.8'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Ambient glows */}
            <div className="hidden dark:block absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-yellow-500/10 rounded-full blur-[180px] pointer-events-none" />
            <div className="hidden dark:block absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-lime-500/10 rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 p-8 max-w-6xl mx-auto space-y-8 pb-24">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-black tracking-widest uppercase">
                                🍌 Alpha v0.1
                            </span>
                            <span className="px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 text-xs font-bold tracking-wider uppercase">
                                Experimental
                            </span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-lime-400 to-yellow-300">
                            Nano Banana
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl leading-relaxed">
                            Upload <span className="text-yellow-500 dark:text-yellow-400 font-bold">front & back</span> garment images, describe your vision, and let the nano engine process your results.
                        </p>
                    </div>

                    {results && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-sm font-bold transition-all border border-slate-200 dark:border-white/10"
                        >
                            <Icon name="RefreshCw" size={16} /> Reset
                        </button>
                    )}
                </div>

                {/* ── Input Panel ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Prompt */}
                    <div className="lg:col-span-2 bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 space-y-4 relative overflow-hidden group">
                        <div className="absolute -top-16 -right-16 w-36 h-36 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors duration-500 pointer-events-none" />

                        <label className="text-xs font-black uppercase text-yellow-600 dark:text-yellow-400 tracking-widest flex items-center gap-2">
                            <Icon name="Edit" size={14} /> Prompt
                        </label>

                        <textarea
                            id="nano-banana-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={5}
                            className="w-full bg-white dark:bg-[#050b14] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 focus:text-slate-900 dark:focus:text-white focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                            placeholder="Describe the garment style, fabric, colors, pattern details..."
                        />

                        {/* Quick tags */}
                        <div className="flex flex-wrap gap-2">
                            {quickTags.map(tag => {
                                const active = prompt.toLowerCase().includes(tag.toLowerCase());
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            if (active) {
                                                setPrompt(p => p.replace(new RegExp(`(, )?${tag}`, 'i'), '').trim());
                                            } else {
                                                setPrompt(p => p ? `${p}, ${tag}` : tag);
                                            }
                                        }}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                            active
                                                ? 'bg-yellow-500/10 border-yellow-400 text-yellow-500 dark:text-yellow-400'
                                                : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageUploadZone
                            label="Front"
                            sublabel="Upload Front View"
                            icon="Image"
                            value={frontImage}
                            onChange={setFrontImage}
                            accentColor="yellow"
                        />
                        <ImageUploadZone
                            label="Back"
                            sublabel="Upload Back View"
                            icon="Image"
                            value={backImage}
                            onChange={setBackImage}
                            accentColor="lime"
                        />
                    </div>
                </div>

                {/* ── Process Button ── */}
                <div className="flex justify-center">
                    <button
                        id="nano-banana-process-btn"
                        onClick={simulateProcess}
                        disabled={!canProcess || processing}
                        className="group relative px-12 py-4 rounded-2xl font-black text-lg tracking-wide transition-all duration-300
                            bg-gradient-to-r from-yellow-400 via-lime-400 to-yellow-300
                            hover:from-yellow-300 hover:via-lime-300 hover:to-yellow-200
                            text-slate-900 shadow-[0_0_30px_rgba(250,204,21,0.4)]
                            hover:shadow-[0_0_50px_rgba(250,204,21,0.6)]
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                            flex items-center gap-3"
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                                Processing... {progress}%
                            </>
                        ) : (
                            <>
                                <span className="text-xl">🍌</span>
                                Run Nano Banana
                                <Icon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                {/* ── Progress Bar ── */}
                {processing && (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-lime-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {progress < 30 ? '🌱 Initializing nano engine...' : progress < 60 ? '⚡ Processing garment data...' : progress < 90 ? '🎨 Rendering visual output...' : '✅ Finalizing results...'}
                        </p>
                    </div>
                )}

                {/* ── Results Section ── */}
                {results && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Results header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Results</h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-500 dark:text-lime-400 text-xs font-bold">
                                    Complete
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Generated {new Date().toLocaleTimeString()}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {results.front ? (
                                <ResultCard label="Front" imageSrc={results.front} accentColor="yellow" />
                            ) : (
                                <div className="rounded-3xl border border-dashed border-yellow-400/20 bg-yellow-400/5 h-80 flex flex-col items-center justify-center text-yellow-400/50 gap-3">
                                    <Icon name="Image" size={36} />
                                    <p className="text-sm font-bold">No front image provided</p>
                                </div>
                            )}

                            {results.back ? (
                                <ResultCard label="Back" imageSrc={results.back} accentColor="lime" />
                            ) : (
                                <div className="rounded-3xl border border-dashed border-lime-400/20 bg-lime-400/5 h-80 flex flex-col items-center justify-center text-lime-400/50 gap-3">
                                    <Icon name="Image" size={36} />
                                    <p className="text-sm font-bold">No back image provided</p>
                                </div>
                            )}
                        </div>

                        {/* Prompt used */}
                        {prompt && (
                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Prompt Used</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{prompt}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Empty State (before any action) ── */}
                {!processing && !results && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-60">
                        <div className="text-6xl animate-bounce">🍌</div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center">
                            Upload your garment images and run the engine to see results here
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
