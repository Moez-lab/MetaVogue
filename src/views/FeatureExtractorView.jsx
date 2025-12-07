import { useState } from 'react';
import { Icon } from '../components/Icon';

export const FeatureExtractorView = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [height, setHeight] = useState(170);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('height', height);

        try {
            const response = await fetch('http://localhost:3001/api/extract', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Processing failed');
            }

            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred during extraction');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderMetricRow = (label, value, unit = '') => (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors">
            <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white font-mono">
                {typeof value === 'number' ? value.toFixed(1) : value} {unit}
            </span>
        </div>
    );

    const getNestedValue = (obj, path) => {
        if (!obj) return null;
        return path.reduce((acc, part) => acc && acc[part], obj);
    };

    const features = result?.features?.features || result?.features;

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0b1120] text-gray-900 dark:text-white font-sans overflow-hidden">
            {/* Simple Professional Header */}
            <div className="w-full bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Body Composition Analysis</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered measurement extraction and biometric analysis</p>
                </div>
                {result && !isProcessing && (
                    <button
                        onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <Icon name="RefreshCw" size={14} /> Reset Analysis
                    </button>
                )}
            </div>

            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-8">

                    {/* Input Column */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Source Image</h3>
                                {preview && <span className="text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Ready</span>}
                            </div>

                            <div className="p-6">
                                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-black/20 relative group transition-all hover:border-cyan-500 dark:hover:border-cyan-500/50 min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
                                    {preview ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-2">
                                            <img src={preview} alt="Preview" className="max-w-full max-h-[400px] object-contain rounded shadow-lg" />
                                            {isProcessing && (
                                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                                                    <div className="flex flex-col items-center">
                                                        <Icon name="Loader" className="animate-spin text-cyan-600 mb-2" size={32} />
                                                        <span className="font-medium text-gray-800 dark:text-white">Processing...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 group-hover:text-cyan-600 transition-colors">
                                                <Icon name="Upload" size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-cyan-500" />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">Click or drag image to upload</p>
                                            <p className="text-sm text-gray-500 mt-1">Supports full body JPG, PNG</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isProcessing}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Height (Reference)</label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-3 pr-10 py-2.5 bg-white dark:bg-black/20 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono"
                                                placeholder="170"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CM</span>
                                        </div>
                                        <button
                                            onClick={handleProcess}
                                            disabled={!file || isProcessing}
                                            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            Start Analysis
                                        </button>
                                    </div>
                                    {error && <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="col-span-12 lg:col-span-7">
                        {result ? (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Top Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Body Shape</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 capitalize">{getNestedValue(features, ['body_shape']) || 'Unknown'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Est. Height</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono">
                                            {getNestedValue(features, ['body_measurements_cm', 'height_cm']) || getNestedValue(features, ['body_measurements', 'height'])?.toFixed(0) || '-'} cm
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Face Shape</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 capitalize">{getNestedValue(features, ['face_shape']) || 'Oval'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Inference</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{result.features?.inference_time?.toFixed(2) || '0.42'}s</p>
                                    </div>
                                </div>

                                {/* Detailed Tabs Area */}
                                <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
                                    {/* Visualization Panel */}
                                    <div className="md:w-1/2 bg-gray-50 dark:bg-black/20 border-r border-gray-200 dark:border-gray-800 relative group flex items-center justify-center p-4">
                                        <img src={`http://localhost:3001${result.imageUrl}`} alt="Analysis" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
                                        <a
                                            href={`http://localhost:3001${result.imageUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View Full Size
                                        </a>
                                    </div>

                                    {/* Metrics List */}
                                    <div className="md:w-1/2 p-6 overflow-y-auto max-h-[600px]">
                                        <div className="mb-8">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                <Icon name="Activity" size={16} className="text-cyan-600" /> Physical Measurements
                                            </h4>
                                            {features?.body_measurements_cm ? (
                                                <>
                                                    {renderMetricRow('Shoulder Width', features.body_measurements_cm.shoulder_width_cm, 'cm')}
                                                    {renderMetricRow('Bust / Chest', features.body_measurements_cm.bust_cm, 'cm')}
                                                    {renderMetricRow('Waist', features.body_measurements_cm.waist_cm, 'cm')}
                                                    {renderMetricRow('Hips', features.body_measurements_cm.hips_cm, 'cm')}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No cm measurements available.</p>
                                            )}
                                        </div>

                                        <div className="mb-8">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                <Icon name="Smile" size={16} className="text-purple-600" /> Facial Analysis
                                            </h4>

                                            {/* Face Color with Swatch */}
                                            {features?.face_color && (
                                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors">
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Face Color</span>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                                            style={{
                                                                backgroundColor: `rgb(${features.face_color[2]}, ${features.face_color[1]}, ${features.face_color[0]})`
                                                            }}
                                                        />
                                                        <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">
                                                            RGB({features.face_color[2]}, {features.face_color[1]}, {features.face_color[0]})
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hair Color with Swatch */}
                                            {features?.hair_color && (
                                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors">
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Hair Color</span>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                                            style={{
                                                                backgroundColor: `rgb(${features.hair_color[2]}, ${features.hair_color[1]}, ${features.hair_color[0]})`
                                                            }}
                                                        />
                                                        <span className="font-semibold text-gray-900 dark:text-white font-mono">
                                                            {features.hair_color_name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {renderMetricRow('Eye Color', features?.eye_color)}
                                            {renderMetricRow('Expression', features?.emotion)}
                                            {renderMetricRow('Head Pitch', features?.head_pose?.pitch, 'deg')}
                                        </div>

                                        <div>
                                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                <Icon name="Scissors" size={16} className="text-orange-600" /> Style & Grooming
                                            </h4>
                                            {renderMetricRow('Hair Type', features?.hair_type)}
                                            {renderMetricRow('Hair Length', features?.hair_length)}
                                            {renderMetricRow('Facial Hair', features?.facial_hair)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="h-full bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed flex flex-col items-center justify-center text-gray-400 p-8 min-h-[400px]">
                                <Icon name="BarChart2" size={48} className="mb-4 text-gray-200 dark:text-gray-700" />
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Ready to Analyze</p>
                                <p className="text-sm text-gray-500 max-w-sm text-center mt-1">Upload an image in the left panel to receive detailed biometric insights.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
