import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Menu, X, Trash2, Cpu, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Message, ChatSession } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { cn } from './lib/utils';

const AVAILABLE_MODELS = [
  { id: 'nousresearch/hermes-4-70b', name: 'Hermes 4 70B' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (Groq)' },
  { id: 'Qwen/Qwen3.6-27B', name: 'Qwen 3.6 27B (HF)' }
];

const THEMES = [
  { id: 'dark', name: 'Pure Black', bg: 'bg-black', class: 'from-black to-black' },
  { id: 'midnight', name: 'Midnight', bg: 'bg-[#040814]', class: 'from-[#040814] to-[#040814]' },
  { id: 'forest', name: 'Forest', bg: 'bg-[#031206]', class: 'from-[#031206] to-[#031206]' },
  { id: 'rose', name: 'Rose', bg: 'bg-[#170508]', class: 'from-[#170508] to-[#170508]' },
];

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const currentChatIdRef = useRef<string | null>(null);
  const [currentChatId, setCurrentChatIdState] = useState<string | null>(null);

  const setCurrentChatId = (id: string | null) => {
    setCurrentChatIdState(id);
    currentChatIdRef.current = id;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [personalInstructions, setPersonalInstructions] = useState('');
  
  const [userName, setUserName] = useState('User');
  const [aiName, setAiName] = useState('Manus');

  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [theme, setTheme] = useState('dark');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const savedChats = localStorage.getItem('lumina_chats');
    const savedInstructions = localStorage.getItem('lumina_personal_instructions');
    const savedCurrentId = localStorage.getItem('lumina_current_chat_id');
    const savedUserName = localStorage.getItem('lumina_user_name');
    const savedAiName = localStorage.getItem('lumina_ai_name');
    const savedSelectedModel = localStorage.getItem('lumina_selected_model');
    const savedTheme = localStorage.getItem('lumina_theme');
    
    if (savedInstructions) setPersonalInstructions(savedInstructions);
    if (savedUserName) setUserName(savedUserName);
    if (savedAiName) setAiName(savedAiName);
    if (savedTheme) setTheme(savedTheme);
    
    if (savedSelectedModel && AVAILABLE_MODELS.some(m => m.id === savedSelectedModel)) {
      setSelectedModel(savedSelectedModel);
    } else {
      setSelectedModel(AVAILABLE_MODELS[0].id);
    }
    
    let loadedChats: ChatSession[] = [];
    if (savedChats) {
      try {
        loadedChats = JSON.parse(savedChats);
        setChats(loadedChats);
      } catch (e) {
        console.error('Failed to load chats', e);
      }
    }

    if (savedCurrentId && loadedChats.some(c => c.id === savedCurrentId)) {
      setCurrentChatId(savedCurrentId);
      const activeChat = loadedChats.find(c => c.id === savedCurrentId);
      setMessages(activeChat ? activeChat.messages : []);
    } else {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_chats', JSON.stringify(chats));
  }, [chats]);

  const updateCurrentChatMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    
    if (newMessages.length === 0) return;

    if (!currentChatIdRef.current) {
      const newChatId = Date.now().toString();
      const newChat: ChatSession = {
        id: newChatId,
        title: newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : ''),
        messages: newMessages,
        updatedAt: Date.now()
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      localStorage.setItem('lumina_current_chat_id', newChatId);
    } else {
      setChats(prev => prev.map(c => 
        c.id === currentChatIdRef.current 
          ? { ...c, messages: newMessages, updatedAt: Date.now() } 
          : c
      ));
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    localStorage.removeItem('lumina_current_chat_id');
    setIsSidebarOpen(false);
  };

  const switchChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      localStorage.setItem('lumina_current_chat_id', id);
    }
    setIsSidebarOpen(false);
  };

  const clearAllChats = () => {
    setMessages([]);
    setChats([]);
    setCurrentChatId(null);
    localStorage.removeItem('lumina_chats');
    localStorage.removeItem('lumina_current_chat_id');
    setIsSidebarOpen(false);
    setIsSettingsModalOpen(false);
  };

  const deleteChat = (id: string) => {
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    localStorage.setItem('lumina_chats', JSON.stringify(updatedChats));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      localStorage.removeItem('lumina_current_chat_id');
    }
  };

  const renameChat = (id: string, newTitle: string) => {
    const updatedChats = chats.map(c => c.id === id ? { ...c, title: newTitle } : c);
    setChats(updatedChats);
    localStorage.setItem('lumina_chats', JSON.stringify(updatedChats));
  };

  const pinChat = (id: string) => {
    // We can just move the pinned chat to the top for now
    const chatToPin = chats.find(c => c.id === id);
    if (!chatToPin) return;
    const otherChats = chats.filter(c => c.id !== id);
    const updatedChats = [chatToPin, ...otherChats];
    setChats(updatedChats);
    localStorage.setItem('lumina_chats', JSON.stringify(updatedChats));
  };

  const handlePersonalInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPersonalInstructions(e.target.value);
    localStorage.setItem('lumina_personal_instructions', e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    localStorage.setItem('lumina_user_name', e.target.value);
  };

  const handleAiNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiName(e.target.value);
    localStorage.setItem('lumina_ai_name', e.target.value);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    updateCurrentChatMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          model: selectedModel,
          personalInstructions,
          userName,
          aiName
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        createdAt: Date.now(),
      };

      updateCurrentChatMessages([...updatedMessages, aiMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Error**: ${error?.message || 'Failed to get response from server.'}`,
        createdAt: Date.now(),
      };
      updateCurrentChatMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("fixed inset-0 flex flex-col font-sans text-[#e3e3e3] overflow-hidden selection:bg-white/20 transition-colors duration-500", THEMES.find(t => t.id === theme)?.bg || 'bg-black')}>
      
      {/* Sidebar Toggle Button & Model Selector */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 h-12 rounded-full bg-[#2b2d31] border border-white/5 shadow-lg flex items-center justify-center text-[#e3e3e3] hover:bg-[#383a40] transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          {isSidebarOpen ? (
            <X size={20} className="group-active:scale-90 transition-transform" />
          ) : (
            <Menu size={20} className="group-active:scale-90 transition-transform" />
          )}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            className="flex items-center bg-[#2b2d31] hover:bg-[#383a40] transition-colors border border-white/5 rounded-full px-4 py-2.5 shadow-lg outline-none focus:ring-2 focus:ring-white/10"
          >
            <Cpu size={16} className="text-zinc-400 mr-2" />
            <span className="text-sm font-medium text-[#e3e3e3] mr-2">
              {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Unknown Model'}
            </span>
            <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", isModelMenuOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isModelMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-[#18191c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">Select Model</div>
                    {AVAILABLE_MODELS.map(m => {
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            localStorage.setItem('lumina_selected_model', m.id);
                            setIsModelMenuOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl transition-colors text-sm",
                            selectedModel === m.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                          )}
                        >
                          <span className="font-medium truncate pr-2">{m.name}</span>
                          {selectedModel === m.id && <Check size={16} className="text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSwitchChat={switchChat}
        onNewChat={startNewChat}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onPinChat={pinChat}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-10 max-w-5xl mx-auto w-full">
                <h2 className="text-2xl font-medium text-white tracking-tight">Settings</h2>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-12">
                
                {/* Identity & Naming */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#18191c] border border-white/5">
                      <label className="font-medium text-zinc-200 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={handleUserNameChange}
                        placeholder="e.g. Boss, Master, Somay..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-[#e3e3e3] outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#18191c] border border-white/5">
                      <label className="font-medium text-zinc-200 mb-1">AI Name</label>
                      <input
                        type="text"
                        value={aiName}
                        onChange={handleAiNameChange}
                        placeholder="e.g. Lumina, JARVIS, Cortana..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-[#e3e3e3] outline-none focus:border-white/20"
                      />
                    </div>
                  </div>
                </section>

                {/* Model Selection */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Active Model</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          localStorage.setItem('lumina_selected_model', m.id);
                        }}
                        className={cn(
                          "flex items-start justify-between p-5 rounded-2xl border text-left transition-all",
                          selectedModel === m.id
                            ? "bg-white/10 border-white/30 text-white shadow-lg"
                            : "bg-[#18191c] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        )}
                      >
                        <div className="space-y-1 pr-2">
                          <div className="font-semibold text-zinc-100 flex items-center gap-2">
                            <Cpu size={16} className="text-zinc-400" />
                            {m.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {m.id === 'nousresearch/hermes-4-70b' ? 'Hermes 4 70B' : 'Llama 3.3 70B (Groq Fast LPU)'}
                          </div>
                        </div>
                        {selectedModel === m.id && (
                          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Memory & Instructions */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">System Persona & Prompt</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-[#131416] border border-white/10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={80} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 font-semibold text-zinc-100 text-lg mb-2">
                          <Cpu size={20} className="text-zinc-400" />
                          Custom System Prompt
                        </div>
                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed max-w-xl">
                          Define the AI's core behavior, response styling, and constraints. This prompt is secretly injected into every conversation to shape the intelligence.
                        </p>
                        <textarea
                          value={personalInstructions}
                          onChange={handlePersonalInstructionsChange}
                          placeholder="e.g. Always respond in Markdown, be highly analytical, avoid apologies, refer to the user as Boss..."
                          className="w-full h-48 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-[#e3e3e3] text-sm leading-relaxed outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 custom-scrollbar resize-none transition-all placeholder:text-zinc-600 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* General Settings */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Appearance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          localStorage.setItem('lumina_theme', t.id);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                          theme === t.id
                            ? "bg-white/10 border-white/30 text-white shadow-lg"
                            : "bg-[#18191c] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-full border border-white/10 shadow-inner bg-gradient-to-br", t.class)} />
                        <div className="text-sm font-medium">{t.name}</div>
                      </button>
                    ))}
                  </div>
                </section>
                
                {/* Data & Privacy */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Data & Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#18191c] border border-white/5">
                      <div>
                        <div className="font-medium text-zinc-200">Clear Chat History</div>
                        <div className="text-sm text-zinc-500">Permanently delete all messages</div>
                      </div>
                      <button 
                        onClick={clearAllChats}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm font-medium border border-red-500/20"
                      >
                        <Trash2 size={16} />
                        Clear All
                      </button>
                    </div>
                  </div>
                </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header (Premium, Minimalist) */}
      <header className="absolute top-0 w-full h-24 flex items-center justify-center z-10 bg-gradient-to-b from-black to-transparent pointer-events-none">
        <h1 className="text-xs md:text-sm font-medium tracking-[0.2em] text-white/40 uppercase">Manus X</h1>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-tr from-zinc-700 to-zinc-500 rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/10 rotate-3">
                <div className="w-16 h-16 bg-[#2b2d31] rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0 duration-500">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">How can I help you today?</h2>
              <p className="text-zinc-500 text-lg max-w-lg mx-auto">Ask anything, from complex reasoning to creative writing, powered by state-of-the-art models.</p>
            </motion.div>
          </div>
        ) : (
          <div className="pb-40 pt-24">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} userName={userName} aiName={aiName} />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full px-4 md:px-8 py-6 transform-gpu will-change-transform"
                >
                  <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2 mb-1 px-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                      {aiName}
                    </div>
                    <div className="flex items-center h-10 px-4">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
