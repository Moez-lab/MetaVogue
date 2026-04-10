import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

export const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hello! I'm Vogue AI, your MetaVogue platform assistant. How can I help you regarding our platform policies or services today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auto-scroll logic
    const chatEndRef = useRef(null);
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const msg = input.trim();
        if (!msg || isLoading) return;

        // Optimistically add user message
        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Build history to send to backend 
            // the backend `/api/chat` expects { message, history }
            // Let's formulate the request.
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: messages
                })
            });

            if (!response.ok) throw new Error("Connection failed");
            
            const data = await response.json();
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: data.reply || "I didn't quite catch that. Could you repeat?"
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "I'm having trouble connecting right now. Vogue AI might be under high demand. Please try again in just a moment!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[99999] font-sans">
            {/* The Chat Pop-up */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 mb-4 w-80 sm:w-96 h-[500px] flex flex-col bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-purple-500/20">
                        <div className="flex items-center gap-3 w-full">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Icon name="sparkles" className="text-white w-5 h-5" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white tracking-wide text-sm">Vogue AI</h3>
                                <p className="text-xs text-purple-300/70">Powered by Gemini</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-medium">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                                    m.role === 'user' 
                                      ? 'bg-purple-600 text-white rounded-br-sm shadow-md' 
                                      : 'bg-slate-800/80 text-slate-200 border border-purple-500/10 rounded-bl-sm shadow-md'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-slate-800/80 text-slate-200 border border-purple-500/10 rounded-bl-sm flex items-center gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-900 border-t border-purple-500/20">
                        <form onSubmit={handleSendMessage} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask Vogue AI..."
                                className="w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-full pl-4 pr-12 py-2.5 outline-none border border-purple-500/20 focus:border-purple-500/60 focus:bg-slate-800 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-1.5 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
                            >
                                <Icon name="send" className="w-5 h-5 pointer-events-none" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* The Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300"
                >
                    <Icon name="sparkles" className="w-6 h-6 text-white group-hover:animate-pulse" />
                    
                    {/* Ripple effects */}
                    <span className="absolute inset-0 rounded-full border-2 border-pink-500 opacity-20 group-hover:animate-ping pointer-events-none" />
                </button>
            )}
        </div>
    );
};
