'use client';

import { use, useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
}

export default function AIPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: isAr 
        ? 'مرحباً! أنا المساعد الذكي الخاص ببسطة 🤖. يمكنني مساعدتك في البحث عن أفضل المنتجات، ومقارنة الأسعار، واقتراح هدايا مناسبة. كيف يمكنني مساعدتك اليوم؟' 
        : "Hello! I am Bastha's smart assistant 🤖. I can help you find the best products, compare prices, and suggest great gifts. How can I help you today?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickActions = isAr ? [
    'أبحث عن حذاء رياضي مريح',
    'ما هي أفضل العروض اليوم؟',
    'أريد هدية لصديقي بحدود 100 شيكل',
    'كيف أتتبع طلبي؟'
  ] : [
    'Looking for comfortable sneakers',
    "What are today's best deals?",
    'Need a gift for a friend under 100 NIS',
    'How do I track my order?'
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
        'عظيم! جاري البحث في آلاف المنتجات عبر منصتنا...',
        'لقد وجدت بعض الخيارات الممتازة التي قد تنال إعجابك. سأعرضها لك الآن.',
        'طلبك قيد المعالجة! بسطة توفر دائماً أفضل المتاجر المحلية بأفضل الأسعار.'
      ] : [
        'Great! Searching through thousands of products on our platform...',
        'I found some excellent options you might like. Let me show them to you.',
        'Processing your request! Bastha always provides the best local stores at the best prices.'
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
    <div className="bg-[#f0f4f8] min-h-screen pt-8 pb-8 flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
      
      <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col relative z-10 h-full">
        
        {/* Header */}
        <div className="bg-white rounded-t-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Bot className="w-7 h-7 text-white -rotate-3" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1a365d] flex items-center gap-2">
                {isAr ? 'بسطة AI' : 'Bastha AI'}
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {isAr ? 'متصل وجاهز للمساعدة' : 'Online & ready to help'}
              </p>
            </div>
          </div>
          <Link href={`/${lang}/products`}>
            <button className="hidden sm:flex items-center gap-2 text-[#2b4c7e] bg-[#eaf1f8] px-4 py-2 rounded-xl font-bold hover:bg-[#d6e4f3] transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {isAr ? 'تصفح المتجر' : 'Browse Store'}
            </button>
          </Link>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#f8fbff] border-x border-gray-100 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.type === 'ai' ? (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
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
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-3xl p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] border border-gray-100 shrink-0">
          
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
            {quickActions.map((action, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap bg-gray-50 hover:bg-[#eaf1f8] hover:text-[#1a365d] text-gray-600 text-sm font-bold px-4 py-2 rounded-full border border-gray-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[#1a365d] focus-within:ring-2 focus-within:ring-[#1a365d]/20 transition-all"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAr ? 'اسألني عن أي منتج...' : 'Ask me about any product...'}
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-gray-800"
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-md ${
                !input.trim() || isTyping 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#1a365d] text-white hover:bg-[#2b4c7e] hover:scale-105'
              }`}
            >
              <Send className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            {isAr ? 'بسطة AI قد يخطئ أحياناً، يرجى التأكد من المعلومات.' : 'Bastha AI can make mistakes. Consider verifying important info.'}
          </p>
        </div>

      </div>
    </div>
  );
}
