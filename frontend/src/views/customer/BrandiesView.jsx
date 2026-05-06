import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';
import { Icon } from '../../components/Icon';
import { UploadZone } from '../../components/UploadZone';
import { uploadFile, BASE_URL } from '../../services/api';

export const BrandiesView = () => {
    const { addOrder, user, orders } = useGlobal();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new');
    const [brandName, setBrandName] = useState('');
    const [modelDescription, setModelDescription] = useState('');
    const [shirtImage, setShirtImage] = useState(null);
    const [shirtFile, setShirtFile] = useState(null);
    const [referenceImage, setReferenceImage] = useState(null);
    const [referenceFile, setReferenceFile] = useState(null);
    const [referenceHeight, setReferenceHeight] = useState('170'); // Default height in cm
    const [showPromptGuide, setShowPromptGuide] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (file) => {
        setShirtFile(file);
        setShirtImage(URL.createObjectURL(file));
    };

    const handleReferenceSelect = (file) => {
        setReferenceFile(file);
        setReferenceImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            let finalShirtUrl = null;
            if (shirtFile) {
                const res = await uploadFile(shirtFile);
                finalShirtUrl = res.url;
            }

            let finalReferenceUrl = null;
            if (referenceFile) {
                const res = await uploadFile(referenceFile);
                finalReferenceUrl = res.url;
            }

            addOrder({
                modelDescription,
                shirtImage: finalShirtUrl,
                referenceImage: finalReferenceUrl,
                referenceHeight: referenceImage ? referenceHeight : null,
                brandEmail: user?.email || 'Unknown',
                brandName: brandName || user?.name || 'Brand',
                paymentStatus: 'Unpaid',
                orderStatus: 'Pending Approval',
                amount: 49.00
            });

            setIsProcessing(false);
            setSubmitted(true);
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Failed to upload image. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setBrandName('');
        setModelDescription('');
        setShirtImage(null);
        setShirtFile(null);
        setReferenceImage(null);
        setReferenceFile(null);
        setReferenceHeight('170');
        setSubmitted(false);
    };

    return (
        <div className="w-full relative font-sans text-white selection:bg-purple-500/30">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0' stroke='%239333ea' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            {/* Ambient Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto flex flex-col min-h-screen">

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 py-8 animate-fade-in-up">
                    <div className="text-left w-full md:w-2/3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            Enterprise Solution
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-2xl">
                            Meta <span className="text-purple-500">Vogue</span>
                        </h1>
                        <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
                            Transform your physical apparel into hyper-realistic digital assets.
                            We combine <span className="text-white font-bold">AI generation</span> with <span className="text-white font-bold">physics simulation</span> to create marketing-ready visuals.
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 animate-fade-in-up">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`text-lg font-bold pb-4 -mb-px transition-colors ${activeTab === 'new' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        New Request
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`text-lg font-bold pb-4 -mb-px transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        My Activity
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{orders.filter(o => o.brandEmail === user?.email).length}</span>
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <>
                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { icon: 'Sparkles', title: 'AI Model Generation', desc: 'Custom human models tailored to your target demographic (Age, Ethnicity, Style).' },
                        { icon: 'Shirt', title: 'Virtual Fitting', desc: 'Advanced cloth simulation ensuring your garment drapes naturally on the model.' },
                        { icon: 'Video', title: '4K Studio Renders', desc: 'High-resolution marketing assets with professional studio lighting setups.' }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                                <Icon name={feature.icon} size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Interaction Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                    {/* Left Column: Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div>
                                        <label className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                            <Icon name="User" size={20} className="text-purple-400" />
                                            Brand Name
                                        </label>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="Enter your brand name..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-base"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-lg font-bold text-white flex items-center gap-2">
                                                <Icon name="User" size={20} className="text-purple-400" />
                                                Model Specification
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPromptGuide(!showPromptGuide)}
                                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold uppercase tracking-wider transition-colors"
                                            >
                                                <Icon name="Info" size={14} />
                                                {showPromptGuide ? 'Hide Guide' : 'Prompt Guide'}
                                            </button>
                                        </div>

                                        {/* Prompt Guide Accordion */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showPromptGuide ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-gray-300">
                                                <p className="font-bold text-purple-300 mb-2">Tips for a perfect result:</p>
                                                <ul className="list-disc pl-5 space-y-1 mb-3 text-gray-400">
                                                    <li><strong>Demographics:</strong> Age, Gender, Ethnicity (e.g., "Asian female, mid-20s")</li>
                                                    <li><strong>Style:</strong> Hair style, makeup, vibe (e.g., "Short bob, natural makeup, street style")</li>
                                                    <li><strong>Pose:</strong> Action or stance (e.g., "Walking forward, hands in pockets")</li>
                                                    <li><strong>Lighting:</strong> Mood (e.g., "Golden hour, studio softbox, neon city")</li>
                                                </ul>
                                                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                                                    <span className="text-purple-400 font-bold text-xs">EXAMPLE:</span>
                                                    <p className="italic text-gray-400 text-xs mt-1">"Professional studio shot of a 30-year-old Scandinavian man with a beard, standing confidently against a grey background, soft cinematic lighting."</p>
                                                </div>
                                            </div>
                                        </div>

                                        <textarea
                                            value={modelDescription}
                                            onChange={(e) => setModelDescription(e.target.value)}
                                            placeholder="Describe your ideal model here..."
                                            className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none text-base leading-relaxed"
                                            required
                                        />
                                    </div>

                                    {/* Apparel Upload */}
                                    <div>
                                        <label className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                            <Icon name="UploadCloud" size={20} className="text-purple-400" />
                                            Apparel Upload
                                        </label>
                                        <p className="text-sm text-gray-500 mb-4">Upload a high-resolution flat lay or ghost mannequin image of your garment.</p>

                                        {shirtImage ? (
                                            <div className="relative h-64 rounded-xl overflow-hidden border border-purple-500/50 group bg-black/40">
                                                <img src={shirtImage} alt="Uploaded Shirt" className="w-full h-full object-contain p-4" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShirtImage(null)}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105"
                                                    >
                                                        <Icon name="Trash" size={16} /> Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <UploadZone 
                                                onFileSelect={handleFileSelect} 
                                                label="Upload Garment" 
                                                sublabel="Drag & drop your apparel file or click to browse."
                                            />
                                        )}
                                    </div>

                                    {/* Reference Image Upload (Optional) */}
                                    <div>
                                        <label className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                            <Icon name="Image" size={20} className="text-blue-400" />
                                            Reference Image (Optional)
                                            <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-md ml-2">PNG / JPG</span>
                                        </label>

                                        {/* Instructions */}
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                                            <p className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                                                <Icon name="Info" size={14} />
                                                Best Results Guidelines:
                                            </p>
                                            <ul className="text-xs text-gray-400 space-y-1.5 ml-5">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    <span><strong className="text-gray-300">Full body shot</strong> - Head to feet visible, standing upright</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    <span><strong className="text-gray-300">Plain background</strong> - Solid color (white/gray preferred)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    <span><strong className="text-gray-300">Good lighting</strong> - Well-lit, no harsh shadows</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    <span><strong className="text-gray-300">Fitted clothing</strong> - Shows body shape clearly</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    <span><strong className="text-gray-300">High resolution</strong> - At least 1080p for best accuracy</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {referenceImage ? (
                                            <div className="relative h-64 rounded-xl overflow-hidden border border-blue-500/50 group bg-black/40">
                                                <img src={referenceImage} alt="Reference" className="w-full h-full object-contain p-4" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReferenceImage(null)}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105"
                                                    >
                                                        <Icon name="Trash" size={16} /> Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <UploadZone 
                                                onFileSelect={handleReferenceSelect} 
                                                label="Upload Reference Model" 
                                                sublabel="Drag & drop a reference image of the model or click to browse."
                                            />
                                        )}

                                        {/* Height Input (shown when reference image is uploaded) */}
                                        {referenceImage && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                                    Reference Person Height (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={referenceHeight}
                                                    onChange={(e) => setReferenceHeight(e.target.value)}
                                                    placeholder="170"
                                                    min="100"
                                                    max="250"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">Enter the height of the person in the reference image for accurate proportions</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Icon name="ShoppingCart" className="text-purple-400" />
                                            Order Summary
                                        </h3>

                                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-400">AI Model Generation</span>
                                                    <span className="text-white font-mono">$49.00</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-400">Virtual Garment Fitting</span>
                                                    <span className="text-green-400 font-mono">Included</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-400">4K Studio Renders</span>
                                                    <span className="text-green-400 font-mono">Included</span>
                                                </div>

                                                <div className="border-t border-white/10 pt-3 mt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-bold text-white">Total Amount</span>
                                                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">$49.00</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!brandName || !modelDescription || !shirtImage || isProcessing}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="Send" size={18} />
                                                Submit Order
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Icon name="CheckCircle" size={48} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2">Order Submitted!</h3>
                                    <p className="text-gray-400 mb-8 max-w-md">
                                        Your request has been received. You will be notified when an admin reviews it.
                                    </p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleReset}
                                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                                        >
                                            Submit Another
                                        </button>
                                        <button
                                            onClick={() => navigate('/my-orders')}
                                            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/30"
                                        >
                                            View My Orders
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Info & Preview */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Process Card */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon name="Clipboard" className="text-purple-400" />
                                The Process
                            </h3>
                            <div className="relative space-y-8">
                                {/* Vertical Line */}
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-purple-500/20"></div>

                                {[
                                    { step: '1', title: 'Upload & Describe', desc: 'Provide your garment image and describe the target model.' },
                                    { step: '2', title: 'AI Generation', desc: 'Our system generates the human model and simulates the cloth physics.' },
                                    { step: '3', title: 'Quality Check', desc: 'Automated lighting and texture optimization.' },
                                    { step: '4', title: 'Delivery', desc: 'Download your 3D assets and high-res marketing images.' }
                                ].map((item, i) => (
                                    <div key={i} className="relative flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-[#050b14] border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0 z-10">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-blue-900/20 backdrop-blur-xl p-6 rounded-3xl border border-blue-500/20">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <Icon name="Info" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Need Assistance?</h4>
                                    <p className="text-sm text-gray-400 mb-3">
                                        Our support team is available 24/7 to help you with complex requests.
                                    </p>
                                    <button className="text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">
                                        Contact Support →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Order History</h2>
                        </div>
                        
                        {orders.filter(o => o.brandEmail === user?.email).length === 0 ? (
                            <div className="text-center py-20 bg-[#111827]/80 rounded-3xl border border-white/10">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                                    <Icon name="Inbox" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No active orders</h3>
                                <p className="text-gray-400">You haven't submitted any transformation requests yet.</p>
                                <button 
                                    onClick={() => setActiveTab('new')}
                                    className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                                >
                                    Start a Request
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {orders.filter(o => o.brandEmail === user?.email).sort((a,b) => new Date(b.date) - new Date(a.date)).map(order => (
                                    <div key={order.id} className="bg-[#111827]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {order.shirtImage ? (
                                                <div className="w-32 h-32 bg-black/40 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                                    <img src={order.shirtImage?.startsWith('http') ? order.shirtImage : `${BASE_URL}${order.shirtImage}`} alt="Garment" className="w-full h-full object-contain p-2" />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-32 bg-black/40 rounded-xl flex items-center justify-center text-gray-600 shrink-0 border border-white/5">
                                                    <Icon name="Image" size={32} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                            <span className="font-mono text-xs text-gray-500">{order.id}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border 
                                                                ${order.status === 'Completed' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 
                                                                  order.status === 'Accepted' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                                                                  order.status === 'Rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                                                                  'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white">{order.brandName || 'Unknown'} Request</h3>
                                                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                                            <Icon name="Calendar" size={14} />
                                                            {new Date(order.date).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    
                                                    {order.status === 'Completed' && order.deliverables && order.deliverables.length > 0 && (
                                                        <a href={order.deliverables[order.deliverables.length - 1].url?.startsWith('http') ? order.deliverables[order.deliverables.length - 1].url : `${BASE_URL}${order.deliverables[order.deliverables.length - 1].url}`} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold transition-colors whitespace-nowrap">
                                                            <Icon name="Download" size={16} /> Download Final
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                        {order.modelDescription}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};