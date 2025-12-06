import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Icon } from '../components/Icon';
import { UploadZone } from '../components/UploadZone';

export const BrandiesView = () => {
    const { addOrder, user } = useGlobal();
    const [brandName, setBrandName] = useState('');
    const [modelDescription, setModelDescription] = useState('');
    const [shirtImage, setShirtImage] = useState(null);
    const [referenceImage, setReferenceImage] = useState(null);
    const [showPromptGuide, setShowPromptGuide] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setShirtImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleReferenceSelect = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setReferenceImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        addOrder({
            modelDescription,
            shirtImage,
            referenceImage, // Optional reference
            brandEmail: user?.email || 'Unknown',
            brandName: brandName || user?.name || 'Brand',
            paymentStatus: 'Paid',
            amount: 49.00
        });

        setIsProcessing(false);
        setSubmitted(true);
    };

    const handleReset = () => {
        setBrandName('');
        setModelDescription('');
        setShirtImage(null);
        setReferenceImage(null);
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setName('');
        setSubmitted(false);
    };

    return (
        <div className="min-h-screen w-full relative bg-[#050b14] overflow-y-auto font-sans text-white selection:bg-purple-500/30">
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
                <div className="text-center py-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        Enterprise Solution
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-2xl">
                        Meta <span className="text-purple-500">Vogue</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        Transform your physical apparel into hyper-realistic digital assets.
                        We combine <span className="text-white font-bold">AI generation</span> with <span className="text-white font-bold">physics simulation</span> to create marketing-ready visuals.
                    </p>
                </div>

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
                                            <UploadZone onFileSelect={handleFileSelect} />
                                        )}
                                    </div>

                                    {/* Reference Image Upload (Optional) */}
                                    <div>
                                        <label className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                            <Icon name="Image" size={20} className="text-blue-400" />
                                            Reference Image (Optional)
                                            <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-md ml-2">PNG / JPG</span>
                                        </label>
                                        <p className="text-sm text-gray-500 mb-4">Upload a reference image for style, pose, or vibe. (Will be converted to PNG if needed)</p>

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
                                            <UploadZone onFileSelect={handleReferenceSelect} title="Upload Reference" subtext="Drag & drop or click to browse" />
                                        )}
                                    </div>

                                    {/* Payment Section */}
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Icon name="CreditCard" className="text-purple-400" />
                                            Payment Details
                                        </h3>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">Card Number</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                        placeholder="0000 0000 0000 0000"
                                                        maxLength="19"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pl-12"
                                                        required
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                        <Icon name="CreditCard" size={20} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-300 mb-2">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        value={expiry}
                                                        onChange={(e) => setExpiry(e.target.value)}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-300 mb-2">CVC</label>
                                                    <input
                                                        type="text"
                                                        value={cvc}
                                                        onChange={(e) => setCvc(e.target.value)}
                                                        placeholder="123"
                                                        maxLength="3"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}

                                    <button
                                        type="submit"
                                        disabled={!brandName || !modelDescription || !shirtImage || !cardNumber || !expiry || !cvc || !name || isProcessing}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="Lock" size={18} />
                                                Pay & Submit Order
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Icon name="CheckCircle" size={48} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2">Order Confirmed!</h3>
                                    <p className="text-gray-400 mb-8 max-w-md">
                                        Payment successful. Our AI is now processing your request. You will receive an email notification when your assets are ready for review.
                                    </p>

                                    <button
                                        onClick={handleReset}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                                    >
                                        Submit Another Request
                                    </button>
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
            </div>
        </div>
    );
};