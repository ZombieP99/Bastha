'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  lang: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, lang }: PaginationProps) {
  const isAr = lang === 'ar';

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-center gap-2 mt-12 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Prev Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#1a365d] hover:border-[#1a365d] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </motion.button>

      {/* Pages */}
      <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        {pages.map((page) => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all shadow-sm ${
              currentPage === page 
                ? 'bg-[#1a365d] text-white border-transparent' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a365d] hover:text-[#1a365d]'
            }`}
          >
            {page}
          </motion.button>
        ))}
      </div>

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#1a365d] hover:border-[#1a365d] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </motion.button>

    </div>
  );
}
