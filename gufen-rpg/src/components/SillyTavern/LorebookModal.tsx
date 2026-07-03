import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Trash2, Edit3, Save, X, ToggleLeft, ToggleRight, 
  Upload, HelpCircle, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { Lorebook, LorebookEntry } from '../../sillytavern/types';

interface LorebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lorebooks: Lorebook[];
  onUpdateLorebook: (updated: Lorebook) => Promise<void>;
  onImportLorebook: (json: string) => Promise<void>;
}

export default function LorebookModal({
  isOpen,
  onClose,
  lorebooks,
  onUpdateLorebook,
  onImportLorebook,
}: LorebookModalProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(lorebooks[0]?.id || '');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states for creating/editing an entry
  const [entryKeys, setEntryKeys] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryComment, setEntryComment] = useState('');
  const [entryPriority, setEntryPriority] = useState(10);
  const [entryIsConstant, setEntryIsConstant] = useState(false);
  const [entryRecursive, setEntryRecursive] = useState(false);

  const [newBookName, setNewBookName] = useState('');
  const [isCreatingBook, setIsCreatingBook] = useState(false);

  if (!isOpen) return null;

  const activeBook = lorebooks.find((b) => b.id === selectedBookId) || lorebooks[0];

  // Create new book
  const handleCreateBook = async () => {
    if (!newBookName.trim()) return;
    const newBook: Lorebook = {
      id: `lore_${Date.now()}`,
      name: newBookName.trim(),
      entries: [],
      isGlobalEnabled: true,
      lastModified: Date.now(),
    };
    await onUpdateLorebook(newBook);
    setSelectedBookId(newBook.id);
    setNewBookName('');
    setIsCreatingBook(false);
  };

  // Toggle book global active status
  const handleToggleBookActive = async (book: Lorebook) => {
    await onUpdateLorebook({
      ...book,
      isGlobalEnabled: !book.isGlobalEnabled,
      lastModified: Date.now(),
    });
  };

  // Create or update entry
  const handleSaveEntry = async () => {
    if (!activeBook) return;
    if (!entryContent.trim()) return;

    const keysArr = entryKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k !== '');

    let updatedEntries = [...activeBook.entries];

    if (editingEntryId === 'new') {
      // Create new
      const newEntry: LorebookEntry = {
        id: `le_${Date.now()}`,
        keys: keysArr,
        content: entryContent.trim(),
        comment: entryComment.trim() || undefined,
        isEnabled: true,
        isConstant: entryIsConstant,
        priority: entryPriority,
        order: activeBook.entries.length,
        recursive: entryRecursive,
      };
      updatedEntries.push(newEntry);
    } else {
      // Edit existing
      updatedEntries = updatedEntries.map((e) => {
        if (e.id === editingEntryId) {
          return {
            ...e,
            keys: keysArr,
            content: entryContent.trim(),
            comment: entryComment.trim() || undefined,
            isConstant: entryIsConstant,
            priority: entryPriority,
            recursive: entryRecursive,
          };
        }
        return e;
      });
    }

    await onUpdateLorebook({
      ...activeBook,
      entries: updatedEntries,
      lastModified: Date.now(),
    });

    setEditingEntryId(null);
    clearEntryForm();
  };

  // Start editing an entry
  const startEditEntry = (entry: LorebookEntry) => {
    setEditingEntryId(entry.id);
    setEntryKeys(entry.keys.join(', '));
    setEntryContent(entry.content);
    setEntryComment(entry.comment || '');
    setEntryPriority(entry.priority);
    setEntryIsConstant(entry.isConstant);
    setEntryRecursive(!!entry.recursive);
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!activeBook) return;
    const filtered = activeBook.entries.filter((e) => e.id !== entryId);
    await onUpdateLorebook({
      ...activeBook,
      entries: filtered,
      lastModified: Date.now(),
    });
  };

  const startNewEntry = () => {
    setEditingEntryId('new');
    clearEntryForm();
  };

  const clearEntryForm = () => {
    setEntryKeys('');
    setEntryContent('');
    setEntryComment('');
    setEntryPriority(10);
    setEntryIsConstant(false);
    setEntryRecursive(false);
  };

  // Import file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        await onImportLorebook(content);
        // refresh selected book
        if (lorebooks.length > 0) {
          setSelectedBookId(lorebooks[lorebooks.length - 1].id);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="lorebook_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div id="lorebook_modal_body" className="w-full max-w-5xl bg-[#1c1a18] border border-[#c2a672]/30 rounded-none shadow-2xl flex flex-col h-[85vh] text-neutral-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#c2a672]/20 flex justify-between items-center bg-[#242220]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#c2a672]" />
            <h2 className="font-brush text-lg tracking-wider text-neutral-100">江湖天机·世界书设定</h2>
          </div>
          <button id="btn_close_lorebook_modal" onClick={onClose} className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Lorebooks list */}
          <div className="w-64 border-r border-[#c2a672]/15 p-4 flex flex-col justify-between bg-[#151413]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">世界书大纲</span>
                <button
                  onClick={() => setIsCreatingBook(true)}
                  className="p-1 text-xs text-[#c2a672] hover:bg-neutral-800 border border-[#c2a672]/20 rounded-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isCreatingBook && (
                <div className="p-2 bg-neutral-900 border border-[#c2a672]/20 space-y-2">
                  <input
                    type="text"
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    placeholder="世界书名称..."
                    className="w-full bg-neutral-950 border border-neutral-800 p-1 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                  />
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button onClick={() => setIsCreatingBook(false)} className="px-1.5 py-0.5 text-neutral-400">取消</button>
                    <button onClick={handleCreateBook} className="px-1.5 py-0.5 bg-[#c2a672] text-black">创建</button>
                  </div>
                </div>
              )}

              {/* Lorebooks List */}
              <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
                {lorebooks.map((book) => {
                  const isSelected = book.id === selectedBookId;
                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#242220] border-[#c2a672]/40 text-white' 
                          : 'bg-[#1c1a18]/20 border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1c1a18]/50'
                      }`}
                    >
                      <span className="font-brush text-sm truncate pr-2">{book.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookActive(book);
                        }}
                        className="text-neutral-500 hover:text-[#c2a672] transition-colors"
                      >
                        {book.isGlobalEnabled ? (
                          <ToggleRight className="w-5 h-5 text-[#c2a672]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Import Area */}
            <div className="border-t border-[#c2a672]/15 pt-4">
              <label className="w-full flex flex-col items-center justify-center p-3 border border-dashed border-[#c2a672]/30 bg-[#242220] hover:bg-[#2c2a27] cursor-pointer transition-colors text-center">
                <Upload className="w-4 h-4 text-[#c2a672] mb-1" />
                <span className="text-[10px] text-[#c2a672] font-mono font-medium">导入酒馆世界书</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">支持 .json 格式</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right Column: Active Lorebook entries list */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1c1a18]">
            {activeBook ? (
              <div className="flex-1 flex overflow-hidden">
                
                {/* List of Entries */}
                <div className="flex-1 p-4 flex flex-col overflow-hidden border-r border-[#c2a672]/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-brush text-base text-neutral-200">
                      设定词列表 ({activeBook.entries.length} 条)
                    </h3>
                    {editingEntryId === null && (
                      <button
                        onClick={startNewEntry}
                        className="px-2.5 py-1 bg-neutral-900 border border-[#c2a672]/30 text-xs font-brush text-[#c2a672] hover:bg-[#c2a672] hover:text-[#1c1a18] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 增 添 设 定
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                    {activeBook.entries.map((entry) => {
                      const isEditing = entry.id === editingEntryId;
                      return (
                        <div
                          key={entry.id}
                          className={`p-3 bg-[#242220] border transition-all ${
                            isEditing 
                              ? 'border-[#c2a672]/50 bg-[#2c2a27]' 
                              : 'border-[#c2a672]/10 hover:border-[#c2a672]/25'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              {/* Key Tag list */}
                              <div className="flex flex-wrap gap-1">
                                {entry.isConstant ? (
                                  <span className="text-[9px] font-mono bg-[#8f3434]/20 text-red-400 border border-red-500/20 px-1">
                                    [常驻常现]
                                  </span>
                                ) : (
                                  entry.keys.map((key, i) => (
                                    <span key={i} className="text-[9px] font-mono bg-blue-950/20 text-blue-400 border border-blue-500/20 px-1">
                                      {key}
                                    </span>
                                  ))
                                )}
                                {entry.comment && (
                                  <span className="text-[9px] font-mono text-neutral-400 pl-1">
                                    ({entry.comment})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-300 font-serif leading-relaxed line-clamp-3">
                                {entry.content}
                              </p>
                              <div className="text-[9px] font-mono text-neutral-500 flex gap-4">
                                <span>优先级: {entry.priority}</span>
                                {entry.recursive && <span>[递归检索]</span>}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 border-l border-neutral-800 pl-3">
                              <button
                                onClick={() => startEditEntry(entry)}
                                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-[#c2a672] transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {activeBook.entries.length === 0 && (
                      <div className="text-center py-16 text-xs text-neutral-500 font-mono">
                        本世界书中尚无设定细节。点击“增添设定”或导入外部世界书。
                      </div>
                    )}
                  </div>
                </div>

                {/* Entry Editing Side Panel */}
                <AnimatePresence>
                  {editingEntryId !== null && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="border-l border-[#c2a672]/15 bg-[#151413] p-4 flex flex-col justify-between overflow-hidden shrink-0"
                    >
                      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                        <div className="flex justify-between items-center border-b border-[#c2a672]/10 pb-2">
                          <h4 className="font-brush text-sm text-[#c2a672]">
                            {editingEntryId === 'new' ? '增添江湖密卷' : '点校江湖设定'}
                          </h4>
                          <button onClick={() => setEditingEntryId(null)} className="text-neutral-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Keys */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-neutral-400 font-mono flex items-center justify-between">
                            <span>触发词汇 (逗号隔开)</span>
                            <span className="text-[10px] text-neutral-500">
                              {entryIsConstant ? '常驻无需填' : '模糊匹配'}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={entryKeys}
                            onChange={(e) => setEntryKeys(e.target.value)}
                            disabled={entryIsConstant}
                            placeholder="如: 洗髓丹, 丹药, 服用"
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672] disabled:opacity-40"
                          />
                        </div>

                        {/* Comment */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-neutral-400 font-mono">设定备注</label>
                          <input
                            type="text"
                            value={entryComment}
                            onChange={(e) => setEntryComment(e.target.value)}
                            placeholder="如: 洗髓丹功效描述"
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-neutral-400 font-mono">设定正文</label>
                          <textarea
                            rows={6}
                            value={entryContent}
                            onChange={(e) => setEntryContent(e.target.value)}
                            placeholder="请描述该词条的详尽背景，当说书剧情或主角操作涉及该关键词时，说书人将自动吸收本段常理..."
                            className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 font-serif leading-relaxed focus:outline-none focus:border-[#c2a672] resize-none"
                          />
                        </div>

                        {/* Advanced Settings */}
                        <div className="space-y-2 border-t border-[#c2a672]/10 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-neutral-400">是否常驻设定</span>
                            <button
                              onClick={() => setEntryIsConstant(!entryIsConstant)}
                              className="text-neutral-400 hover:text-[#c2a672]"
                            >
                              {entryIsConstant ? (
                                <ToggleRight className="w-8 h-8 text-[#c2a672]" />
                              ) : (
                                <ToggleLeft className="w-8 h-8" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-neutral-400">优先级 (越深越大)</span>
                            <input
                              type="number"
                              value={entryPriority}
                              onChange={(e) => setEntryPriority(parseInt(e.target.value) || 10)}
                              className="w-16 bg-neutral-950 border border-neutral-800 p-1 text-center text-xs text-neutral-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#c2a672]/10 pt-4 mt-2">
                        <button
                          onClick={handleSaveEntry}
                          className="w-full py-2 bg-[#c2a672] text-black hover:bg-[#c2a672]/90 font-brush font-bold tracking-widest text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" /> 存 入 秘 卷
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-neutral-500 font-mono text-xs">
                没有选中的世界书。请先创建一个世界书。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
