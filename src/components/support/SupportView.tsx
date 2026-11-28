'use client';
import type { Dictionary } from '@/types/dictionary';

import { AnimatePresence,motion } from 'framer-motion';
import {
ArrowLeft,
ArrowRight,
BadgeCheck,
Banknote,
Check,
CheckCircle2,
ChevronDown,
Clock,
Copy,
FileText,
HelpCircle,
Mail,
MessageCircle,
Phone,
RotateCcw,
Search,
ShieldCheck,
X
} from 'lucide-react';
import { useMemo,useState } from 'react';
import toast from 'react-hot-toast';

interface SupportViewProps {
  dict: Dictionary;
  lang: string;
  initialTab?: string;
}

export default function SupportView({ dict, lang, initialTab = 'contact' }: SupportViewProps) {
  const isAr = lang === 'ar';
  const t = dict?.support || {};

  const validTabs = ['contact', 'faq', 'policies'];
  const [activeTab, setActiveTab] = useState(() => {
    return validTabs.includes(initialTab) ? initialTab : 'contact';
  });

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'order'
  });
  const isSubmitting = false;
  const [isSent, setIsSent] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // FAQ State
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqItems: Array<{ q: string; a: string; category?: string }> = useMemo(() => {
    const rawItems: Array<{ q: string; a: string }> = t.faq?.items || [];
    // Enrich with categories
    return rawItems.map((item, idx) => ({
      ...item,
      category: idx === 1 ? 'payment' : (idx === 0 || idx === 2 || idx === 3 || idx === 4) ? 'orders' : 'merchants'
    }));
  }, [t.faq?.items]);

  const faqCategories = [
    { id: 'all', label: isAr ? 'جميع الأسئلة' : 'All Questions' },
    { id: 'orders', label: isAr ? 'الطلبات والتوصيل' : 'Orders & Delivery' },
    { id: 'payment', label: isAr ? 'الدفع والاستلام' : 'Cash on Delivery' },
    { id: 'merchants', label: isAr ? 'للتجار والبائعين' : 'For Sellers' },
  ];

  const filteredFaqs = useMemo(() => {
    return faqItems.filter(item => {
      const matchesCategory = faqCategory === 'all' || item.category === faqCategory;
      const query = faqSearch.trim().toLowerCase();
      const matchesSearch = !query || item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, faqCategory, faqSearch]);

  const handleCopy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch { toast.error(isAr?'تعذر النسخ':'Unable to copy'); return; }
    setCopiedKey(key);
    toast.success(isAr ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error(isAr ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    toast.error(isAr ? 'خدمة الرسائل غير متاحة بعد. لم تُرسل الرسالة.' : 'Messaging is not available yet. Your message was not sent.');
  };

  const subjectPresets = [
    { id: 'order', label: isAr ? 'استفسار عن طلب' : 'Order inquiry' },
    { id: 'shop', label: isAr ? 'بخصوص متجر' : 'Shop issue' },
    { id: 'seller', label: isAr ? 'الانضمام كتاجر' : 'Become a seller' },
    { id: 'other', label: isAr ? 'موضوع آخر' : 'General' },
  ];

  return (
    <div className="bg-gradient-to-b from-[#eaf1f8]/60 via-[#f8fafc] to-[#f8fafc] min-h-screen pt-12 pb-24 selection:bg-[#1a365d] selection:text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          {/* Eyebrow Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-5"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-[#1a365d] tracking-wide">
              {isAr ? 'مركز الدعم والمساعدة • متاحون لخدمتك' : 'Customer Support • Ready to Help'}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1a365d] tracking-tight leading-tight mb-4"
          >
            {isAr ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
          >
            {t.pageSubtitle || (isAr ? 'فريق بسطة هنا للإجابة عن أسئلتك، وحل مشكلاتك، وضمان تجربة تسوق محلية آمنة وموثوقة.' : 'Bastah support is here to answer your questions, resolve issues, and ensure a reliable local shopping experience.')}
          </motion.p>
        </div>

        {/* TABS SWITCHER - Apple-Style Sliding Segmented Pill */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(26,54,93,0.06)] border border-gray-100 flex items-center gap-1.5 w-full max-w-lg relative">
            <button
              onClick={() => setActiveTab('contact')}
              className={`relative z-10 flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'contact' ? 'text-white' : 'text-gray-500 hover:text-[#1a365d]'
              }`}
            >
              {activeTab === 'contact' && (
                <motion.div
                  layoutId="activeSupportTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] rounded-xl shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Mail className="w-4 h-4" strokeWidth={2} />
              <span>{t.contactTab || (isAr ? 'تواصل معنا' : 'Contact Us')}</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`relative z-10 flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'faq' ? 'text-white' : 'text-gray-500 hover:text-[#1a365d]'
              }`}
            >
              {activeTab === 'faq' && (
                <motion.div
                  layoutId="activeSupportTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] rounded-xl shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <HelpCircle className="w-4 h-4" strokeWidth={2} />
              <span>{t.faqTab || (isAr ? 'الأسئلة الشائعة' : 'FAQ')}</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`relative z-10 flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'policies' ? 'text-white' : 'text-gray-500 hover:text-[#1a365d]'
              }`}
            >
              {activeTab === 'policies' && (
                <motion.div
                  layoutId="activeSupportTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] rounded-xl shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>{t.policiesTab || (isAr ? 'السياسات' : 'Policies')}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CONTACT US */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Contact Channels (Cards) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Email Card */}
              <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)] hover:shadow-[0_12px_32px_rgba(26,54,93,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100/70 text-[#1a365d] flex items-center justify-center shadow-inner">
                      <Mail className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        {t.contact?.emailLabel || (isAr ? 'البريد الإلكتروني' : 'Email Address')}
                      </div>
                      <a aria-disabled="true" className="font-extrabold text-[#1a365d] hover:text-[#2b4c7e] text-base sm:text-lg block transition-colors">
                        support@bastah.com
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('support@bastah.com', 'email')}
                    className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-[#1a365d] hover:bg-gray-100 transition-all"
                    title={isAr ? 'نسخ البريد' : 'Copy email'}
                  >
                    {copiedKey === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                  {isAr ? 'الرد عادةً خلال 24 ساعة كحد أقصى' : 'Average reply time within 24 hours'}
                </p>
              </div>

              {/* Phone / WhatsApp Card */}
              <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)] hover:shadow-[0_12px_32px_rgba(26,54,93,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/70 text-emerald-700 flex items-center justify-center shadow-inner">
                      <Phone className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        {t.contact?.phoneLabel || (isAr ? 'الهاتف المباشر والواتساب' : 'Phone & WhatsApp')}
                      </div>
                      <a aria-disabled="true" dir="ltr" className="font-extrabold text-[#1a365d] hover:text-emerald-700 text-base sm:text-lg block transition-colors">
                        غير متاح / Not available
                      </a>
                    </div>
                  </div>
                  <button
                    disabled
                    className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                    title={isAr ? 'نسخ الرقم' : 'Copy phone'}
                  >
                    {copiedKey === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                  {isAr ? 'مكالمات ورسائل فورية طيلة أيام العمل' : 'Calls & messages during workdays'}
                </p>
              </div>

              {/* Working Hours Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/70 text-amber-700 flex items-center justify-center shadow-inner">
                    <Clock className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      {t.contact?.hoursLabel || (isAr ? 'ساعات العمل' : 'Operating Hours')}
                    </div>
                    <div className="font-extrabold text-[#1a365d] text-sm sm:text-base">
                      {isAr ? 'الأحد – الخميس: ٩:٠٠ ص – ٥:٠٠ م' : 'Sun – Thu: 9:00 AM – 5:00 PM'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash On Delivery Assurance Box */}
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#1a365d] to-[#0f274a] text-white shadow-xl">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center shrink-0 border border-white/10">
                    <Banknote className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isAr ? 'ضمان بسطة المالي' : 'Bastah Guarantee'}
                    </div>
                    <h4 className="text-base font-extrabold mb-1.5">
                      {isAr ? 'الدفع نقداً عند الاستلام فقط' : '100% Cash On Delivery'}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      {isAr
                        ? 'لحمايتك، لا تطلب منصة بسطة أي بيانات بنكية أو بطاقات دفع إطلاقاً. تدفع قيمة مشترياتك نقداً للمتجر أو مندوب التوصيل بعد معاينة طلبك.'
                        : 'For your security, Bastah never asks for card or bank details. You always pay cash directly to the merchant upon inspecting your delivery.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Contact Form Container (Double-Bezel Card) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_8px_30px_rgba(26,54,93,0.04)] relative">
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#1a365d] tracking-tight mb-2">
                  {t.contact?.title || (isAr ? 'أرسل لنا رسالة مباشرة' : 'Send us a message')}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  {t.contact?.subtitle || (isAr ? 'يسعدنا سماع استفساراتك واقتراحاتك وسيجيبك فريقنا في أقرب وقت.' : 'Fill out the form below and our team will get back to you shortly.')}
                </p>
              </div>

              {isSent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 sm:p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-2xl font-extrabold text-emerald-950 mb-2">
                    {t.contact?.success || (isAr ? 'تم استلام رسالتك بنجاح!' : 'Your message has been sent!')}
                  </h4>
                  <p className="text-emerald-800 text-sm max-w-md mx-auto leading-relaxed mb-8">
                    {isAr ? 'شكراً لتواصلك مع بسطة. رقم تذكرتك تم تسجيله وسيتواصل معك أحد مسؤولي خدمة العملاء عبر بريدك الإلكتروني.' : 'Thank you for reaching out. Our support team will review your message and reply via email.'}
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="inline-flex items-center gap-2 bg-white text-emerald-900 border border-emerald-300/80 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-100/50 transition-all shadow-sm"
                  >
                    {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <p role="status">{isAr ? 'نموذج التواصل غير متاح حالياً. لم يتم ربط خدمة استقبال الرسائل بعد.' : 'The contact form is currently unavailable. Message delivery has not been connected yet.'}</p>
                  
                  {/* Category Pills */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      {isAr ? 'نوع الاستفسار' : 'Inquiry Category'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {subjectPresets.map(preset => (
                        <button
                          type="button"
                          key={preset.id}
                          onClick={() => setFormData(prev => ({ ...prev, category: preset.id }))}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            formData.category === preset.id
                              ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-sm'
                              : 'bg-gray-50 border-gray-200/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#1a365d] mb-2">
                        {t.contact?.name || (isAr ? 'الاسم الكامل' : 'Full Name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.contact?.namePlaceholder || (isAr ? 'مثال: يوسف أحمد' : 'e.g. John Doe')}
                        className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-sm font-medium focus:outline-none focus:border-[#1a365d] focus:bg-white focus:ring-4 focus:ring-[#1a365d]/5 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#1a365d] mb-2">
                        {t.contact?.email || (isAr ? 'البريد الإلكتروني' : 'Email Address')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.contact?.emailPlaceholder || 'name@example.com'}
                        className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-sm font-medium focus:outline-none focus:border-[#1a365d] focus:bg-white focus:ring-4 focus:ring-[#1a365d]/5 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-[#1a365d] mb-2">
                      {t.contact?.subject || (isAr ? 'عنوان الرسالة' : 'Subject')}
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t.contact?.subjectPlaceholder || (isAr ? 'موضوع المشكلة أو الاستفسار بالتفصيل' : 'Brief subject summary')}
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-sm font-medium focus:outline-none focus:border-[#1a365d] focus:bg-white focus:ring-4 focus:ring-[#1a365d]/5 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-[#1a365d] mb-2">
                      {t.contact?.message || (isAr ? 'نص الرسالة' : 'Message')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t.contact?.messagePlaceholder || (isAr ? 'اكتب كل ما ترغب بمشاركته معنا...' : 'Describe how we can assist you...')}
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 text-gray-800 text-sm font-medium focus:outline-none focus:border-[#1a365d] focus:bg-white focus:ring-4 focus:ring-[#1a365d]/5 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button (Button-in-Button Architecture) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled title={isAr ? 'غير متاح حالياً' : 'Not available yet'}
                      className="group w-full sm:w-auto bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white px-8 py-4 rounded-2xl font-extrabold text-sm hover:shadow-xl hover:shadow-[#1a365d]/20 hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span>{t.contact?.sending || (isAr ? 'جارٍ الإرسال...' : 'Sending...')}</span>
                      ) : (
                        <>
                          <span>{t.contact?.send || (isAr ? 'إرسال الرسالة الآن' : 'Send Message Now')}</span>
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            {isAr ? (
                              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </motion.div>
        )}

        {/* TAB 2: FAQ */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Search Bar & Categories Filter */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)] space-y-4">
              
              {/* Search input with clear button */}
              <div className="relative">
                <Search className={`w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder={isAr ? 'ابحث عن إجابة (مثال: الدفع، التوصيل، الإرجاع)...' : 'Search answers (e.g. cash, delivery, returns)...'}
                  className={`w-full bg-[#f8fafc] border border-gray-200/80 rounded-2xl py-3.5 text-gray-800 text-sm font-medium focus:outline-none focus:border-[#1a365d] focus:bg-white focus:ring-4 focus:ring-[#1a365d]/5 transition-all ${
                    isAr ? 'pr-12 pl-10' : 'pl-12 pr-10'
                  }`}
                />
                {faqSearch && (
                  <button
                    onClick={() => setFaqSearch('')}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 ${isAr ? 'left-3' : 'right-3'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {faqCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFaqCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      faqCategory === cat.id
                        ? 'bg-[#1a365d] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Questions List */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-[#1a365d] text-lg mb-1">
                  {isAr ? 'لم نجد نتائج مطابقة لبحثك' : 'No matching answers found'}
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  {isAr ? 'جرب البحث بكلمة مختلفة أو راسل فريق الدعم مباشرة.' : 'Try a different query or get in touch with our team directly.'}
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-[#1a365d] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#2b4c7e] transition-all shadow-sm"
                >
                  {isAr ? 'تواصل مع الدعم الآن' : 'Contact Support Directly'}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  const itemNumber = (index + 1).toString().padStart(2, '0');

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                        isOpen 
                          ? 'border-[#1a365d]/20 shadow-[0_10px_30px_rgba(26,54,93,0.06)]' 
                          : 'border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-6 text-start flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg transition-colors ${
                            isOpen ? 'bg-[#1a365d] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {itemNumber}
                          </span>
                          <span className="font-extrabold text-[#1a365d] text-base sm:text-lg leading-snug">
                            {faq.q}
                          </span>
                        </div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                          isOpen ? 'bg-[#1a365d]/5 text-[#1a365d] rotate-180' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <ChevronDown className="w-5 h-5" strokeWidth={2} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-6 pb-6 pt-1 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-50">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Help Banner */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex items-center gap-4 text-center sm:text-start">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <MessageCircle className="w-7 h-7 text-amber-300" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-1">
                    {isAr ? 'لم تجد الإجابة التي تبحث عنها؟' : "Didn't find what you need?"}
                  </h4>
                  <p className="text-white/80 text-sm font-medium">
                    {isAr ? 'فريق الدعم متاح للمساعدة والرد على كافة الاستفسارات.' : 'Our customer support team is on standby to assist.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('contact')}
                className="relative z-10 bg-white text-[#1a365d] hover:bg-[#eaf1f8] font-black px-7 py-3.5 rounded-2xl transition-all shadow-md text-sm shrink-0 hover:scale-105 active:scale-95"
              >
                {isAr ? 'تواصل معنا الآن' : 'Contact Us'}
              </button>
            </div>

          </motion.div>
        )}

        {/* TAB 3: POLICIES */}
        {activeTab === 'policies' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header intro */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {isAr ? 'الشفافية والأمان' : 'Transparency & Safety'}
                </span>
                <h3 className="text-2xl font-black text-[#1a365d]">
                  {t.policies?.title || (isAr ? 'سياسات وشروط منصة بسطة' : 'Bastah Platform Policies')}
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'سياسات المنصة' : 'Platform policies'}</span>
              </div>
            </div>

            {/* Privacy Policy Card */}
            <div id="privacy" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)]">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a365d] flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#1a365d]">
                    {t.policies?.privacy?.title || (isAr ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy & Data Protection')}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    {isAr ? 'وقت القراءة: دقيقتان' : '2 min read'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed pt-2 border-t border-gray-50">
                {t.policies?.privacy?.content || (
                  isAr 
                    ? 'نحن في بسطة نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. نجمع فقط المعلومات الضرورية لتشغيل الخدمة وتسهيل التواصل بينك وبين المتاجر المحلية. لا نشارك بياناتك أو نبيعها لأي طرف ثالث لأغراض دعائية. يحق لك في أي وقت طلب حذف حسابك وسجل طلباتك من خوادمنا بشكل كامل.'
                    : 'At Bastah, we respect your privacy and are committed to protecting your personal data. We only collect the necessary information required to operate the service and connect you with local stores. We never sell your data to third parties. You may request full account deletion at any time.'
                )}
              </p>
            </div>

            {/* Terms of Service Card */}
            <div id="terms" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)]">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                  <FileText className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#1a365d]">
                    {t.policies?.terms?.title || (isAr ? 'شروط وأحكام الاستخدام' : 'Terms of Service')}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    {isAr ? 'اتفاقية الاستخدام' : 'User Agreement'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed pt-2 border-t border-gray-50">
                {t.policies?.terms?.content || (
                  isAr
                    ? 'باستخدامك لمنصة بسطة، فإنك تقر وتوافق على الالتزام بالقواعد الآتية: تقديم معلومات اتصال صحيحة ودقيقة لضمان وصول الطلب، الالتزام بالدفع نقداً عند استلام الطلبات المؤكدة، واحترام سياسات التجار المحليين. تحتفظ منصة بسطة بالحق في حظر أي حساب يسيء استخدام خدمة الطلبات أو يقدم معلومات وهمية.'
                    : 'By using the Bastah platform, you agree to provide accurate information for deliveries, honor confirmed cash orders, and respect local merchants. Bastah reserves the right to suspend any accounts that abuse the platform or submit fraudulent reservations.'
                )}
              </p>
            </div>

            {/* Returns & Replacements Policy Card */}
            <div id="returns" className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)]">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <RotateCcw className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#1a365d]">
                    {t.policies?.returns?.title || (isAr ? 'سياسة الإرجاع والاستبدال للمتاجر' : 'Return & Exchange Policy')}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    {isAr ? 'حق المشتري عند الاستلام' : 'Buyer protection upon inspection'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed pt-2 border-t border-gray-50">
                {t.policies?.returns?.content || (
                  isAr
                    ? 'يحق للمشتري معاينة المنتج والتأكد من مطابقته للمواصفات قبل تسليم المبلغ للمندوب. في حال وجود أي عيب مصنعي أو اختلاف جوهري عن المعروض، يُمكنك رفض الاستلام أو طلب استبدال خلال 48 ساعة بالتنسيق مع المتجر. يتدخل فريق بسطة لحل أي نزاع يطرأ بين العميل والمتجر لضمان الإنصاف.'
                    : 'Buyers have the right to inspect goods prior to payment. If an item is defective or significantly differs from description, you may refuse delivery or request an exchange within 48 hours. Bastah mediates any disputes to ensure fair resolution.'
                )}
              </p>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
