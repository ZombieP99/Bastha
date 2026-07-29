'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
}

export default function FloatingButton({ dict, lang }: { dict: any, lang: string }) {
  const isAr = lang === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const quickActions = isAr ? [
    'أبحث عن حذاء مريح',
    'ما هي العروض اليوم؟',
  ] : [
    'Comfortable sneakers',
    "Today's best deals",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), type: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = isAr ? [
        'عظيم! جاري البحث عبر منصتنا...',
        'لقد وجدت بعض الخيارات التي قد تعجبك.',
      ] : [
        'Great! Searching on our platform...',
        'I found some options you might like.',
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: randomResponse
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-24 z-50 w-[90vw] sm:w-[400px] h-[500px] max-h-[70vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 ${isAr ? 'left-6' : 'right-6'}`}
            style={{ [isAr ? 'left' : 'right']: '1.5rem' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-[#1a365d]"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-1 text-sm">
                    {isAr ? 'بسطة AI' : 'Bastha AI'}
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </h3>
                  <p className="text-xs text-blue-100">{isAr ? 'متصل دائماً' : 'Always online'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#f8fbff] overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.type === 'ai' ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.type === 'user' 
                          ? 'bg-[#1a365d] text-white rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-100 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-1">
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(action)}
                    className="whitespace-nowrap bg-gray-50 hover:bg-[#eaf1f8] text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-100 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-[#1a365d] transition-colors"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك...' : 'Type a message...'}
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-800"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                    !input.trim() || isTyping 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#1a365d] text-white hover:bg-[#2b4c7e]'
                  }`}
                >
                  <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        whileHover={{ scale: 1.05, rotate: isAr ? -15 : 15 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 z-50 bg-[#6b705c] hover:bg-[#5a5e4d] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors font-bold ${isAr ? 'left-6' : 'right-6'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
