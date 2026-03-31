import { useState, useRef } from 'react';
import { Icon } from './Icon';

export const UploadZone = ({ onFileSelect, accept = "image/*", maxSize = 10485760 }) => { // 10MB default
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (!file) return false;
        if (!file.type.startsWith('image/')) {
            setError("Invalid file type. Protocol requires visual data.");
            return false;
        }
        if (file.size > maxSize) {
            setError(`File size exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB).`);
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                onFileSelect(file);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                onFileSelect(file);
            }
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="relative w-full group">
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={false}
                accept={accept}
                onChange={handleChange}
            />

            <div
                className={`
                    relative w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden
                    ${dragActive
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-[1.02]'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0f18] hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-[#111827]'}
                    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
            >
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Scanning Line Animation (Active only) */}
                {dragActive && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] absolute top-0 animate-[scan_2s_linear_infinite]"></div>
                    </div>
                )}

                <div className="relative z-10 text-center p-8 transition-transform duration-300 group-hover:scale-105">
                    <div className={`
                        w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500
                        ${dragActive
                            ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                            : 'bg-white dark:bg-white/5 text-slate-400 dark:text-gray-500 shadow-sm dark:shadow-none group-hover:bg-cyan-500/10 group-hover:text-cyan-400'}
                    `}>
                        <Icon name="UploadCloud" size={40} className={dragActive ? 'animate-bounce' : ''} />
                    </div>

                    <h3 className={`text-xl font-bold mb-2 transition-colors ${dragActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                        {dragActive ? 'Initiating Scan...' : 'Drop Source Material'}
                    </h3>

                    <p className="text-slate-500 dark:text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                        Drag & drop your garment file or click to browse database.
                    </p>

                    {error && (
                        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 justify-center animate-shake">
                            <Icon name="AlertCircle" size={14} />
                            {error}
                        </div>
                    )}

                    <button className="px-6 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-white transition-all flex items-center gap-2 mx-auto shadow-sm dark:shadow-none">
                        <Icon name="File" size={16} />
                        Select File
                    </button>
                </div>
            </div>
        </div>
    );
};
