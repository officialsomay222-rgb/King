import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus input automatically on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '32px'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      
      if (e.target.value === '') {
        setIsExpanded(false);
        return;
      }
      
      const newHeight = Math.min(Math.max(scrollHeight, 32), 200);
      textareaRef.current.style.height = `${newHeight}px`;
      
      setIsExpanded(scrollHeight > 40);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSend(input.trim());
    setInput('');
    setIsExpanded(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '32px';
    }
  };

  return (
    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-[env(safe-area-inset-bottom)] px-4 flex justify-center z-20 pointer-events-none">
      <div className="w-full pb-4 md:pb-8 flex justify-center pointer-events-none">
        <form 
          onSubmit={handleSubmit}
          className={cn(
            "pointer-events-auto flex items-end w-full max-w-[800px] bg-[#212328] px-5 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-300 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20 focus-within:shadow-[0_15px_40px_rgba(0,0,0,0.7)]",
            isExpanded ? "rounded-[24px]" : "rounded-[36px] min-h-[64px] items-center"
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none outline-none text-[#e3e3e3] text-lg md:text-xl font-normal placeholder:text-zinc-500 disabled:opacity-50 resize-none custom-scrollbar overflow-y-auto max-h-[200px] leading-[32px] py-0 px-1"
            style={{ height: '32px' }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "ml-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group active:scale-95 transform-gpu shadow-md",
              input.trim() && !isLoading
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-white/10 text-zinc-500 cursor-not-allowed",
              isExpanded && "mb-0.5"
            )}
            title="Send Message"
          >
            <ArrowUp size={20} className="stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

