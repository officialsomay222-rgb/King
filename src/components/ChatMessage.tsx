import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  userName: string;
  aiName: string;
}

export function ChatMessage({ message, userName, aiName }: ChatMessageProps) {
  const isAi = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        "flex w-full px-4 md:px-8 py-6 transform-gpu will-change-transform bg-transparent"
      )}
    >
      <div className={cn(
        "w-full max-w-4xl mx-auto flex flex-col gap-2",
        isAi ? "items-start" : "items-end"
      )}>
        <div className="flex items-center gap-2 mb-1 px-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          {isAi ? aiName : userName}
        </div>
        
        <div className={cn(
          "w-full max-w-[85%]",
          isAi ? "" : "bg-[#2b2d31] text-white px-5 py-4 rounded-3xl rounded-tr-sm shadow-sm"
        )}>
          {isAi ? (
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#2b2d31] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none text-[#d1d5db]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-[17px] font-normal leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
