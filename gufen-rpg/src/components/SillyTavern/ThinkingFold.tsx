import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingFoldProps {
  thinking: string;
}

export default function ThinkingFold({ thinking }: ThinkingFoldProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking || thinking.trim() === '') return null;

  return (
    <div id="thinking_fold_container" className="my-2 border border-dashed border-[#c2a672]/20 bg-[#1c1a18]/40 p-2.5 transition-all">
      <button
        id="btn_toggle_thinking"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-mono text-[#c2a672]/70 hover:text-[#c2a672] transition-colors focus:outline-none"
      >
        <span className="flex items-center gap-1.5 font-brush text-xs tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#c2a672] animate-pulse" />
          天演变卦推理中... (展开查看说书推演过程)
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="thinking_text_content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-2 mt-1.5 border-t border-[#c2a672]/10 text-xs font-mono text-neutral-400 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pl-2 border-l-2 border-l-[#8f3434]/50">
              {thinking}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
