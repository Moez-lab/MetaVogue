import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

export const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm Vogue AI. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isLoading) return;

    const newUserMessage = { role: 'user', content: msg };
    const initialModelMessage = { role: 'model', content: '' };

    setMessages(prev => [...prev, newUserMessage, initialModelMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages, stream: true })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = ''; // Buffer to handle partial lines across chunks

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        buffer += decoder.decode(value, { stream: !done });

        // Split by the double newline that separates SSE data events
        const parts = buffer.split('\n\n');
        
        // The last part might be incomplete, so we keep it in the buffer
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.replace('data: ', '');
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  const last = { ...updated[lastIndex] };
                  if (last.role === 'model') {
                    last.content += parsed.chunk;
                    updated[lastIndex] = last;
                  }
                  return updated;
                });
              }
            } catch (e) {
              console.warn('Incomplete JSON in stream part, will retry:', dataStr);
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'model' && !last.content) {
          last.content = 'Connection issue. Please try again.';
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] sm:w-96 h-[520px] max-h-[calc(100vh-100px)] flex flex-col bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Icon name="Sparkles" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Vogue AI</h3>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow ${
                  m.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1 px-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300" />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800 text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 p-2 rounded-full hover:bg-purple-500 disabled:opacity-50"
            >
              <Icon name="Send" className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <Icon name="Sparkles" className="w-6 h-6" />
      </button>
    </div>
  );
};
