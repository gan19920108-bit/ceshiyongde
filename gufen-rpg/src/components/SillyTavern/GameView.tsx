import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Cloud, CloudRain, Wind, CloudFog, Snowflake, Send, Square, 
  Menu, Sparkles, RefreshCw, Play, Settings, AlertTriangle, ChevronLeft, 
  ChevronRight, Calendar, MapPin, Eye, Compass, Copy, Edit3, Trash2, 
  MoreHorizontal, ChevronDown, Award, Zap, CheckCircle, Info
} from 'lucide-react';
import { Character, GameTime, TavernMessage, Skill, InventoryItem, Relation, Quest } from '../../types';
import { CharacterPreset, Lorebook, SillyTavernSettings } from '../../sillytavern/types';
import ThinkingFold from './ThinkingFold';
import SettingsModal from './SettingsModal';
import LorebookModal from './LorebookModal';

interface GameViewProps {
  character: Character;
  time: GameTime;
  messages: TavernMessage[];
  skills: Skill[];
  inventory: InventoryItem[];
  relations: Relation[];
  quests: Quest[];
  settings: SillyTavernSettings;
  presets: CharacterPreset[];
  lorebooks: Lorebook[];
  activePreset: CharacterPreset | null;
  isGenerating: boolean;
  thinkingStream: string;
  maintextStream: string;
  optionsStream: string[];
  notifications: any[];
  addNotification: (text: string, type: 'success' | 'warn' | 'info') => void;
  sendGameMessage: (input: string) => Promise<void>;
  restoreToFloor: (messageId: string) => Promise<void>;
  triggerBreakthrough: () => void;
  saveSettings: (settings: SillyTavernSettings) => void;
  changePreset: (id: string) => Promise<void>;
  onUpdatePreset: (updated: CharacterPreset) => Promise<void>;
  onImportPreset: (json: string) => Promise<void>;
  onUpdateLorebook: (updated: Lorebook) => Promise<void>;
  onImportLorebook: (json: string) => Promise<void>;
  onSaveSlot: (slot: string) => void;
  onLoadSlot: (slot: string) => void;
  onResetGame: () => Promise<void>;
  onOpenModalTab: (tabId: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<TavernMessage[]>>;
}

export default function GameView({
  character,
  time,
  messages,
  skills,
  inventory,
  relations,
  quests,
  settings,
  presets,
  lorebooks,
  activePreset,
  isGenerating,
  thinkingStream,
  maintextStream,
  optionsStream,
  notifications,
  addNotification,
  sendGameMessage,
  restoreToFloor,
  triggerBreakthrough,
  saveSettings,
  changePreset,
  onUpdatePreset,
  onImportPreset,
  onUpdateLorebook,
  onImportLorebook,
  onSaveSlot,
  onLoadSlot,
  onResetGame,
  onOpenModalTab,
  setMessages,
}: GameViewProps) {
  const [inputValue, setInputValue] = useState('');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);

  // Settings / Lorebook Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLorebooksOpen, setIsLorebooksOpen] = useState(false);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);

  // Edit Message inline state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll on message update or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, maintextStream]);

  // Outside click listener to dismiss menus
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
      setShowFunctionMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Weather icon dispatcher
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case '晴空': return <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />;
      case '多云': return <Cloud className="w-4 h-4 text-gray-400" />;
      case '小雨': return <CloudRain className="w-4 h-4 text-sky-400" />;
      case '狂风': return <Wind className="w-4 h-4 text-emerald-400 animate-pulse" />;
      case '迷雾': return <CloudFog className="w-4 h-4 text-teal-400" />;
      case '落雪': return <Snowflake className="w-4 h-4 text-blue-200 animate-bounce" />;
      default: return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  // Right click handler
  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId,
    });
  };

  // Context menu actions
  const handleCopyMessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      navigator.clipboard.writeText(msg.text);
      addNotification('🌸 消息妙笔已抄录在册（复制成功）！', 'success');
    }
    setContextMenu(null);
  };

  const handleEditMessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      setEditingMessageId(messageId);
      setEditMessageText(msg.text);
    }
    setContextMenu(null);
  };

  const handleSaveEditedMessage = () => {
    if (!editMessageText.trim() || !editingMessageId) return;
    setMessages((prev) =>
      prev.map((msg) => (msg.id === editingMessageId ? { ...msg, text: editMessageText } : msg))
    );
    addNotification('✍️ 消息正文经由春秋笔法点校修改成功！', 'success');
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    const confirm = window.confirm('云少侠，当真要将此一回合的因果言语永久抹去吗？');
    if (confirm) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      addNotification('🔥 言语因果已付之一炬（删除成功）！', 'warn');
    }
    setContextMenu(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;
    const txt = inputValue.trim();
    setInputValue('');
    await sendGameMessage(txt);
  };

  const handleOptionClick = async (optionText: string) => {
    if (isGenerating) return;
    await sendGameMessage(optionText);
  };

  // Regenerate last player turn
  const handleRegenerate = async () => {
    if (isGenerating) return;
    // Find last player message
    const playerMsgs = messages.filter((m) => m.sender === 'player');
    if (playerMsgs.length === 0) {
      addNotification('前方尚无您的发端因果，无法重新推演！', 'warn');
      return;
    }
    const lastPlayerMsg = playerMsgs[playerMsgs.length - 1];
    
    // Remove last ai message & player message from screen state
    const playerIdx = messages.findIndex((m) => m.id === lastPlayerMsg.id);
    setMessages(messages.slice(0, playerIdx));
    
    // Resend
    await sendGameMessage(lastPlayerMsg.text);
  };

  // Continue generation
  const handleContinue = async () => {
    if (isGenerating) return;
    await sendGameMessage('续写天机描述，详加交代前情后果。');
  };

  // Exp percentage helper
  const expPercent = Math.min(100, (character.exp / character.maxExp) * 100);
  const hpPercent = Math.min(100, (character.hp / character.maxHp) * 100);
  const mpPercent = Math.min(100, (character.mp / character.maxMp) * 100);

  const isBreakthroughAvailable = character.exp >= character.maxExp;

  return (
    <div id="game_view_root" className="flex-1 flex flex-col h-screen relative overflow-hidden bg-[#121110] select-none">
      
      {/* 1. TOP STATE BAR */}
      <header id="game_state_header" className="h-16 bg-[#1c1a18] border-b border-[#c2a672]/30 flex items-center justify-between px-6 z-10 ink-box-shadow">
        
        {/* Left: Cultivation Year and Season */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#c2a672]">
          <div className="flex items-center gap-1.5 border border-[#c2a672]/20 bg-neutral-900/60 py-1 px-2.5">
            <Calendar className="w-3.5 h-3.5 text-[#8f3434]" />
            <span className="font-brush text-sm tracking-wider">宣德 {time.eraYear} 年</span>
          </div>
          <div className="flex items-center gap-1.5 border border-[#c2a672]/20 bg-neutral-900/60 py-1 px-2.5">
            <span className="font-brush text-sm tracking-wider text-neutral-200">
              {time.month}月 {time.day} · {time.shichen}时
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-neutral-400 bg-neutral-950/40 px-2 py-0.5 text-[10px]">
            <span>季节:</span>
            <span className="text-neutral-200 font-brush">
              {time.season === 'spring' ? '春暖花开' : time.season === 'summer' ? '烈日炎炎' : time.season === 'autumn' ? '秋高气爽' : '白雪皑皑'}
            </span>
          </div>
        </div>

        {/* Center: Realm & Breakthrough Notification */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="font-brush text-sm text-neutral-100 tracking-widest">{character.name}</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-[#8f3434]/20 border border-[#8f3434]/40 px-1 py-0.5 rounded-none">
                {character.phase}
              </span>
            </div>
            {/* EXP Bar */}
            <div className="w-32 bg-neutral-900 h-1.5 mt-1 border border-neutral-800 relative">
              <div 
                className="bg-emerald-500/80 h-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
              <span className="absolute inset-0 flex justify-center items-center text-[8px] font-mono text-neutral-400">
                修为: {character.exp}/{character.maxExp}
              </span>
            </div>
          </div>

          {/* Golden flashing breakthrough button */}
          <AnimatePresence>
            {isBreakthroughAvailable && (
              <motion.button
                id="btn_breakthrough_glowing"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                onClick={triggerBreakthrough}
                className="px-3.5 py-1.5 bg-[#c2a672] text-black text-xs font-brush font-bold border-2 border-white shadow-[0_0_15px_rgba(194,166,114,0.6)] hover:bg-[#c2a672]/90 flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-black" /> 突破契机现！
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Location & Weather & Settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[#c2a672]/20 bg-neutral-900/60 py-1 px-2.5 text-xs text-[#3d6e7a]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-brush text-sm tracking-wider text-neutral-100">{time.location}</span>
          </div>

          <div className="p-2 border border-[#c2a672]/20 bg-neutral-900/60 flex items-center justify-center">
            {getWeatherIcon(time.weather)}
          </div>

          {/* Quick Config Button */}
          <button
            id="btn_open_quick_settings"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 border border-[#c2a672]/20 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400 hover:text-[#c2a672] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. MAIN SPLIT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT TIMELINE SCROLL BAR (三生石时空楼阁) */}
        <AnimatePresence>
          {isHistoryDrawerOpen ? (
            <motion.aside
              id="history_snapshot_drawer"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-[#c2a672]/30 bg-[#151413] flex flex-col h-full overflow-hidden shrink-0 z-20 shadow-2xl"
            >
              <div className="p-4 border-b border-[#c2a672]/20 flex justify-between items-center bg-[#1c1a18]">
                <span className="font-brush text-sm tracking-widest text-[#c2a672] flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> 三生石·时空断代
                </span>
                <button
                  id="btn_close_drawer"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                <p className="text-[10px] text-neutral-400 font-mono text-center pb-2 border-b border-neutral-800/60">
                  点击楼层断代上的“回溯时空”即可倒转乾坤，将所有变量与行囊恢复到当时 snapshot！
                </p>

                {messages.map((msg, index) => {
                  const isPlayer = msg.sender === 'player';
                  return (
                    <div
                      key={msg.id}
                      className={`p-2.5 border text-xs flex flex-col gap-1 transition-all ${
                        isPlayer 
                          ? 'bg-[#1c1a18]/20 border-neutral-800' 
                          : 'bg-[#242220]/60 border-[#c2a672]/15'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                        <span className="text-[#c2a672]/80">{msg.senderName}</span>
                        <span>楼层 #{index + 1}</span>
                      </div>
                      <p className="text-neutral-300 truncate font-serif leading-relaxed">
                        {msg.text}
                      </p>
                      
                      {/* Backtracking Trigger Button */}
                      {!isPlayer && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => restoreToFloor(msg.id)}
                            className="px-2 py-0.5 bg-[#8f3434]/10 border border-[#8f3434]/30 text-[9px] font-brush text-[#df8787] hover:bg-[#8f3434] hover:text-white transition-colors cursor-pointer"
                          >
                            🕒 回溯此断代 (Backtrack)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          ) : (
            // Tiny bar to expand
            <div className="w-4 bg-neutral-950 border-r border-[#c2a672]/10 flex items-center justify-center hover:bg-neutral-900 cursor-pointer transition-colors" onClick={() => setIsHistoryDrawerOpen(true)}>
              <ChevronRight className="w-3 h-3 text-neutral-500" />
            </div>
          )}
        </AnimatePresence>

        {/* CENTER SCROLL CHAT PANEL */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden bg-[#121110] relative">
          
          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
            
            {messages.map((msg) => {
              const isPlayer = msg.sender === 'player';
              const isEditing = msg.id === editingMessageId;

              return (
                <div
                  key={msg.id}
                  id={`msg_${msg.id}`}
                  onContextMenu={(e) => handleContextMenu(e, msg.id)}
                  className={`flex flex-col max-w-[90%] gap-1.5 animate-fade-in ${
                    isPlayer ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  {/* Sender title */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 select-none">
                    <span className="font-brush text-xs text-[#c2a672]">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                    
                    {/* Tiny option trigger on hover */}
                    <button
                      onClick={(e) => handleContextMenu(e, msg.id)}
                      className="p-1 hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Message box */}
                  <div
                    className={`p-4 border font-serif text-sm leading-relaxed whitespace-pre-wrap ink-box-shadow select-text relative ${
                      isPlayer
                        ? 'bg-[#1c1a18]/60 border-neutral-800 text-neutral-200 rounded-none'
                        : 'parchment-dark-bg border-[#c2a672]/20 text-neutral-200 rounded-none'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          className="w-full bg-neutral-950 border border-[#c2a672]/30 p-2 text-xs text-neutral-200 font-serif leading-relaxed focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 text-xs text-neutral-400">取消</button>
                          <button onClick={handleSaveEditedMessage} className="px-2 py-0.5 bg-[#c2a672] text-black text-xs font-brush">完成</button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-neutral-200">
                        {/* Thinking is parsed inside narrator message */}
                        {!isPlayer && msg.id === messages[messages.length - 1]?.id && thinkingStream && (
                          <ThinkingFold thinking={thinkingStream} />
                        )}
                        {/* Fallback to stored thinking if any */}
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* LIVE STREAMING DISPLAY BLOCK */}
            {isGenerating && maintextStream && (
              <div className="flex flex-col max-w-[90%] gap-1.5 mr-auto items-start">
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                  <span className="font-brush text-xs text-[#c2a672]">{activePreset?.charName}</span>
                  <span className="animate-pulse">推衍流转中...</span>
                </div>

                <div className="p-4 border font-serif text-sm leading-relaxed whitespace-pre-wrap ink-box-shadow parchment-dark-bg border-[#c2a672]/30 text-neutral-200 rounded-none border-l-4 border-l-[#c2a672]">
                  {/* Thinking stream block */}
                  {thinkingStream && <ThinkingFold thinking={thinkingStream} />}
                  
                  {/* Story text typing stream */}
                  <div className="text-neutral-200">{maintextStream}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. DYNAMIC AI GENERATED OPTION BUTTONS */}
          <div className="max-w-4xl mx-auto w-full px-6 pb-2 select-none">
            {/* Show active option stream or current stable options list from latest message */}
            {(optionsStream.length > 0 || (messages.length > 0 && !isGenerating)) && (
              <div className="flex flex-wrap gap-2.5 justify-center py-2 border-t border-b border-[#c2a672]/10 mb-2">
                {(isGenerating ? optionsStream : (optionsStream.length > 0 ? optionsStream : [])).map((opt, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(opt)}
                    disabled={isGenerating}
                    className="px-3.5 py-1.5 bg-neutral-900 border border-[#c2a672]/30 hover:bg-[#c2a672] hover:text-black hover:border-transparent text-xs text-neutral-300 font-brush tracking-wide transition-all disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-300 cursor-pointer rounded-none flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-[#c2a672] hover:text-inherit" />
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. CONTROLS INPUT BAR */}
          <div className="h-20 border-t border-[#c2a672]/30 bg-[#1c1a18] p-4 flex items-center justify-between z-10 ink-box-shadow select-none">
            
            {/* Function popover button */}
            <div className="relative">
              <button
                id="btn_function_menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFunctionMenu(!showFunctionMenu);
                }}
                className="px-3.5 py-2.5 bg-neutral-950 border border-[#c2a672]/30 hover:border-[#c2a672] text-xs font-brush tracking-widest text-[#c2a672] flex items-center gap-1 cursor-pointer rounded-none"
              >
                <span>卦象变奏</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showFunctionMenu && (
                  <motion.div
                    id="function_popover"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 left-0 z-30 bg-[#1c1a18] border-2 border-[#c2a672]/50 p-1 ink-box-shadow min-w-[150px] rounded-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        handleRegenerate();
                        setShowFunctionMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-brush text-neutral-200 hover:bg-[#c2a672]/10 hover:text-white flex items-center gap-2 border-b border-neutral-800 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#c2a672]" /> 重新推演本轮
                    </button>
                    <button
                      onClick={() => {
                        handleContinue();
                        setShowFunctionMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-brush text-neutral-200 hover:bg-[#3d6e7a]/20 hover:text-white flex items-center gap-2 border-b border-neutral-800 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-400" /> 续写天道前缘
                    </button>
                    <button
                      onClick={() => {
                        setIsLorebooksOpen(true);
                        setShowFunctionMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-brush text-neutral-200 hover:bg-[#8f3434]/20 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> 江湖世界书管理
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text Input Box */}
            <div className="flex-1 mx-4 relative">
              <input
                id="main_chat_input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isGenerating}
                placeholder="云少侠，你准备如何破局？在此撰写你要做出的武林惊人之举..."
                className="w-full h-11 bg-neutral-950 border border-neutral-800 focus:border-[#c2a672] p-3 text-sm text-neutral-200 font-serif leading-relaxed focus:outline-none disabled:opacity-40"
              />
            </div>

            {/* Send or Stop button */}
            {isGenerating ? (
              <button
                id="btn_stop_generation"
                onClick={() => {
                  // We simulate stop by resetting generation state.
                  // (The request is cut off in the browser flow).
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `msg_stopped_${Date.now()}`,
                      sender: 'narrator',
                      senderName: activePreset?.charName || '说书人',
                      text: maintextStream || '【天演命途截断】少侠中途打断了天理演化。',
                      timestamp: `${time.shichen} ${time.location}`,
                    },
                  ]);
                  window.stop(); // Stops browser request streams
                  addNotification('✋ 天理命盘已止！生成请求已停止。', 'warn');
                }}
                className="h-11 px-5 bg-red-950 border border-red-800 hover:bg-red-900 text-red-300 font-brush tracking-widest text-xs flex items-center gap-1.5 animate-pulse cursor-pointer rounded-none"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" /> 停 止 演 化
              </button>
            ) : (
              <button
                id="btn_send_message"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-11 px-6 bg-neutral-950 border border-[#c2a672]/30 hover:bg-[#c2a672] hover:text-black font-brush font-bold tracking-widest text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:hover:bg-neutral-950 disabled:hover:text-neutral-400 transition-all cursor-pointer rounded-none"
              >
                <Send className="w-3.5 h-3.5" /> 命 盘 推 演
              </button>
            )}

          </div>

        </main>

        {/* FLOATING RIGHT SIDE NAVIGATION BAR */}
        <nav id="right_nav_rail" className="w-24 bg-[#1c1a18] border-l border-[#c2a672]/30 flex flex-col justify-start items-center py-4 space-y-3 relative overflow-y-auto ink-box-shadow select-none shrink-0">
          <div className="w-[80%] border-b border-[#c2a672]/10 pb-1 mb-2 text-center text-[10px] font-mono text-neutral-500 font-brush">
            天机法门
          </div>

          {[
            { id: 'profile', label: '个人信息', color: 'hover:text-[#8f3434]' },
            { id: 'inventory', label: '物品背包', color: 'hover:text-amber-500' },
            { id: 'skills', label: '技能天赋', color: 'hover:text-purple-400' },
            { id: 'map', label: '九州地图', color: 'hover:text-[#3d6e7a]' },
            { id: 'relations', label: '人际关系', color: 'hover:text-[#df8787]' },
            { id: 'quests', label: '任务列表', color: 'hover:text-emerald-500' },
            { id: 'shop', label: '系统商城', color: 'hover:text-yellow-500' },
            { id: 'events', label: '世界事件', color: 'hover:text-blue-400' },
            { id: 'country', label: '国家总览', color: 'hover:text-neutral-400' },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenModalTab(item.id)}
              className={`w-[90%] py-2 border border-[#c2a672]/15 bg-neutral-900/40 hover:border-[#c2a672] transition-all cursor-pointer flex flex-col items-center ${item.color}`}
            >
              <span className="font-brush text-[11px] tracking-widest text-neutral-200">{item.label}</span>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="w-[90%] py-2 border border-[#c2a672]/30 bg-[#262421] hover:border-[#c2a672] transition-all cursor-pointer flex flex-col items-center text-amber-600"
          >
            <span className="font-brush text-[11px] tracking-widest text-neutral-200">游戏设置</span>
          </motion.button>
        </nav>

      </div>

      {/* 5. OVERLAY MODALS */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSaveSettings={saveSettings}
            presets={presets}
            activePresetId={settings.selectedPresetId}
            onChangePreset={changePreset}
            onImportPreset={onImportPreset}
            onUpdatePreset={onUpdatePreset}
            onSaveSlot={onSaveSlot}
            onLoadSlot={onLoadSlot}
            onResetGame={onResetGame}
            onAddNotification={addNotification}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLorebooksOpen && (
          <LorebookModal
            isOpen={isLorebooksOpen}
            onClose={() => setIsLorebooksOpen(false)}
            lorebooks={lorebooks}
            onUpdateLorebook={onUpdateLorebook}
            onImportLorebook={onImportLorebook}
          />
        )}
      </AnimatePresence>

      {/* 6. CONTEXT MENU */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            id="message_context_menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-40 bg-[#1c1a18] border-2 border-[#c2a672]/50 p-1 ink-box-shadow min-w-[140px] rounded-none"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleEditMessage(contextMenu.messageId)}
              className="w-full text-left px-3 py-1.5 text-xs font-brush text-neutral-200 hover:bg-[#8f3434]/20 hover:text-white flex items-center gap-2 border-b border-neutral-800 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#c2a672]" /> 编辑消息
            </button>
            <button
              onClick={() => handleCopyMessage(contextMenu.messageId)}
              className="w-full text-left px-3 py-1.5 text-xs font-brush text-neutral-200 hover:bg-[#3d6e7a]/20 hover:text-white flex items-center gap-2 border-b border-neutral-800 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#5cb1c7]" /> 复制消息
            </button>
            <button
              onClick={() => handleDeleteMessage(contextMenu.messageId)}
              className="w-full text-left px-3 py-1.5 text-xs font-brush text-[#df8787] hover:bg-[#8f3434]/30 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" /> 删除消息
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. TOAST NOTIFICATION LAYER */}
      <div id="internal_toast_container" className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => {
            const isWarn = notif.type === 'warn';
            const isSuccess = notif.type === 'success';
            const borderCol = isWarn ? 'border-red-500/50 bg-[#3a1a1a]/95' : isSuccess ? 'border-emerald-500/50 bg-[#152e25]/95' : 'border-[#c2a672]/50 bg-[#242220]/95';
            const textColor = isWarn ? 'text-red-300' : isSuccess ? 'text-emerald-300' : 'text-[#c2a672]';
            const icon = isWarn ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> : isSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <Info className="w-4 h-4 text-blue-400 shrink-0" />;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className={`p-3 border-2 flex items-center gap-2.5 ink-box-shadow pointer-events-auto ${borderCol} rounded-none`}
              >
                {icon}
                <span className={`font-mono text-xs leading-relaxed ${textColor}`}>{notif.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
