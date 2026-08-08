import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Settings, Search, Clock, Pin, UserCircle, Sparkles, Edit2, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onSwitchChat: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onDeleteChat?: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onPinChat?: (id: string) => void;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  chats, 
  currentChatId, 
  onSwitchChat, 
  onNewChat, 
  onOpenSettings,
  onDeleteChat,
  onRenameChat,
  onPinChat
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-30 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-[320px] bg-[#0a0a0a] border-r border-white/5 z-40 flex flex-col shadow-2xl"
          >
            {/* Header / Brand */}
            <div className="p-6 pt-8 pb-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles size={18} className="text-white relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold tracking-wider text-white/95 text-lg">MANUS X</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Intelligence Core</span>
                </div>
              </div>
            </div>

            {/* Actions & Search */}
            <div className="px-4 pb-4 space-y-4 shrink-0">
              <button 
                onClick={onNewChat}
                className="relative group flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white text-black font-semibold transition-all hover:bg-zinc-200 active:scale-[0.98] w-full overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <MessageSquare size={18} className="relative z-10" />
                <span className="relative z-10">New Chat</span>
              </button>

              <div className="relative group">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  placeholder="Search memory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131416] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#e3e3e3] outline-none focus:border-white/20 focus:bg-[#18191c] transition-all placeholder:text-zinc-600 shadow-inner"
                />
              </div>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
              {filteredChats.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 mt-2">
                    <Clock size={14} className="text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</span>
                  </div>
                  
                  {filteredChats.map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => onSwitchChat(chat.id)}
                      className={cn(
                        "group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left overflow-hidden cursor-pointer",
                        currentChatId === chat.id 
                          ? "bg-white/10 text-white border border-white/5" 
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white transition-transform duration-300",
                          currentChatId === chat.id ? "scale-y-100" : "scale-y-0"
                        )} />
                        {editingChatId === chat.id ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (onRenameChat && editTitle.trim()) {
                                onRenameChat(chat.id, editTitle.trim());
                              }
                              setEditingChatId(null);
                            }}
                            className="flex-1 w-full pl-1"
                          >
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => {
                                if (onRenameChat && editTitle.trim()) {
                                  onRenameChat(chat.id, editTitle.trim());
                                }
                                setEditingChatId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-black/50 text-white px-2 py-0.5 rounded outline-none border border-white/20 text-sm"
                            />
                          </form>
                        ) : (
                          <span className="truncate flex-1 text-sm pl-1">{chat.title}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div 
                          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white text-zinc-400 transition-colors"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (onPinChat) onPinChat(chat.id);
                          }}
                          title="Pin"
                        >
                          <Pin size={14} />
                        </div>
                        <div 
                          className="p-1.5 rounded-md hover:bg-white/10 hover:text-white text-zinc-400 transition-colors"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingChatId(chat.id);
                            setEditTitle(chat.title);
                          }}
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </div>
                        <div 
                          className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (onDeleteChat) onDeleteChat(chat.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Search size={20} className="text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">No chats found.</p>
                </div>
              )}
            </div>
            
            {/* User Profile / Settings Footer */}
            <div className="p-4 border-t border-white/5 shrink-0 bg-[#0a0a0a]">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center shrink-0">
                    <UserCircle size={24} className="text-white/80" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-white truncate">Administrator</span>
                    <span className="text-xs text-zinc-500 truncate">Pro Tier Active</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
