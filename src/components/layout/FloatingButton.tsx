'use client';
import { Store } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingButton({ dict }: { dict: any }) {
  return (
    <motion.button 
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-50 bg-[#6b705c] hover:bg-[#5a5e4d] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors font-bold"
    >
      {dict?.floatingButton || 'Start Selling'}
      <Store className="w-5 h-5" />
    </motion.button>
  );
}
