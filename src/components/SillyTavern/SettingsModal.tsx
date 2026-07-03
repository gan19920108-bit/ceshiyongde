import React, { useState, useEffect } from 'react';
import { 
  Settings, X, Save, ShieldAlert, Cpu, Download, Database, RotateCcw, 
  Sparkles, Sliders, Play, Trash2, FileCode, Check 
} from 'lucide-react';
import { CharacterPreset, SillyTavernSettings } from '../../sillytavern/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SillyTavernSettings;
  onSaveSettings: (settings: SillyTavernSettings) => void;
  presets: CharacterPreset[];
  activePresetId: string;
  onChangePreset: (presetId: string) => Promise<void>;
  onImportPreset: (json: string) => Promise<void>;
  onUpdatePreset: (updated: CharacterPreset) => Promise<void>;
  onSaveSlot: (slot: string) => void;
  onLoadSlot: (slot: string) => void;
  onResetGame: () => Promise<void>;
  onAddNotification: (text: string, type: 'success' | 'warn' | 'info') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  presets,
  activePresetId,
  onChangePreset,
  onImportPreset,
  onUpdatePreset,
  onSaveSlot,
  onLoadSlot,
  onResetGame,
  onAddNotification,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'api' | 'saves'>('preset');

  // API Setting Form States
  const [temp, setTemp] = useState(settings.temperature);
  const [topP, setTopP] = useState(settings.topP);
  const [systemOverride, setSystemOverride] = useState(settings.systemInstructionOverride || '');
  const [apiType, setApiType] = useState(localStorage.getItem('setting_apiType') || 'gemini');

  // Character Editing States
  const [selectedPresetId, setSelectedPresetId] = useState(activePresetId);
  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  // Preset Form editing states
  const [pName, setPName] = useState('');
  const [pPersonality, setPPersonality] = useState('');
  const [pSystem, setPSystem] = useState('');
  const [pScenario, setPScenario] = useState('');
  const [pExample, setPExample] = useState('');
  const [pFirstMes, setPFirstMes] = useState('');

  // Save Slots Timestamps for display
  const [slotTimes, setSlotTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Reload slots times
      const times: Record<string, string> = {};
      ['1', '2', '3', '4'].forEach((slot) => {
        const t = localStorage.getItem(`game_save_time_${slot}`);
        times[slot] = t || '空置中';
      });
      setSlotTimes(times);
    }
  }, [isOpen]);

  // Sync form when selectedPreset changes
  useEffect(() => {
    if (selectedPreset) {
      setPName(selectedPreset.charName);
      setPPersonality(selectedPreset.charPersonality);
      setPSystem(selectedPreset.systemPrompt);
      setPScenario(selectedPreset.scenario);
      setPExample(selectedPreset.mesExample);
      setPFirstMes(selectedPreset.firstMes);
    }
  }, [selectedPresetId, presets]);

  if (!isOpen) return null;

  const handleApplyApiSettings = () => {
    localStorage.setItem('setting_apiType', apiType);
    onSaveSettings({
      ...settings,
      temperature: temp,
      topP,
      systemInstructionOverride: systemOverride.trim(),
    });
    onAddNotification('✨ 天演推演参数（API设置）已调整完毕并注入星轨！', 'success');
  };

  const handleUpdatePresetDetails = async () => {
    if (!selectedPreset) return;
    const updated: CharacterPreset = {
      ...selectedPreset,
      charName: pName,
      charPersonality: pPersonality,
      systemPrompt: pSystem,
      scenario: pScenario,
      mesExample: pExample,
      firstMes: pFirstMes,
      lastModified: Date.now(),
    };
    await onUpdatePreset(updated);
    onAddNotification(`已成功编校说书人【${pName}】的言语魂魄设定！`, 'success');
  };

  // Preset import
  const handlePresetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        await onImportPreset(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div id="settings_modal_body" className="w-full max-w-4xl bg-[#1c1a18] border border-[#c2a672]/30 rounded-none shadow-2xl flex flex-col h-[80vh] text-neutral-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#c2a672]/20 flex justify-between items-center bg-[#242220]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#c2a672]" />
            <h2 className="font-brush text-lg tracking-wider text-neutral-100">江湖天律·游戏设置</h2>
          </div>
          <button id="btn_close_settings_modal" onClick={onClose} className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Tabs */}
          <div className="w-48 border-r border-[#c2a672]/15 bg-[#151413] p-4 flex flex-col gap-1 shrink-0">
            <button
              id="tab_preset"
              onClick={() => setActiveTab('preset')}
              className={`w-full py-2.5 px-3 text-left font-brush text-sm flex items-center gap-2 border-l-2 transition-all ${
                activeTab === 'preset'
                  ? 'bg-[#242220] text-[#c2a672] border-[#c2a672]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#242220]/30 border-transparent'
              }`}
            >
              <Cpu className="w-4 h-4" /> 戏目说书人设置
            </button>
            <button
              id="tab_api"
              onClick={() => setActiveTab('api')}
              className={`w-full py-2.5 px-3 text-left font-brush text-sm flex items-center gap-2 border-l-2 transition-all ${
                activeTab === 'api'
                  ? 'bg-[#242220] text-[#c2a672] border-[#c2a672]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#242220]/30 border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4" /> 天演算力 (API)
            </button>
            <button
              id="tab_saves"
              onClick={() => setActiveTab('saves')}
              className={`w-full py-2.5 px-3 text-left font-brush text-sm flex items-center gap-2 border-l-2 transition-all ${
                activeTab === 'saves'
                  ? 'bg-[#242220] text-[#c2a672] border-[#c2a672]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#242220]/30 border-transparent'
              }`}
            >
              <Database className="w-4 h-4" /> 存档管理 & 溯回
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#1c1a18]">
            {activeTab === 'preset' && selectedPreset && (
              <div className="space-y-6">
                
                {/* Selector */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="font-brush text-base text-neutral-100">选择说书人戏目</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">不同说书人决定着截然不同的江湖世界观与行文气质</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => setSelectedPresetId(e.target.value)}
                      className="bg-neutral-950 border border-[#c2a672]/30 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>{p.charName}</option>
                      ))}
                    </select>

                    {selectedPresetId !== activePresetId && (
                      <button
                        onClick={() => onChangePreset(selectedPresetId)}
                        className="bg-[#c2a672] text-black font-brush font-bold px-3 py-1.5 text-xs hover:bg-[#c2a672]/80 flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> 变 奏 登 场
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Details Editor */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-400">说书人名讳</label>
                      <input
                        type="text"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-400">登场首句开场白 (若切换角色将以此开局)</label>
                      <input
                        type="text"
                        value={pFirstMes}
                        onChange={(e) => setPFirstMes(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-400">说书人性情 / 说话口吻特点</label>
                    <textarea
                      rows={2}
                      value={pPersonality}
                      onChange={(e) => setPPersonality(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#c2a672] flex items-center gap-1">
                      <span>说书人系统天律 (System Instructions)</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#c2a672]" />
                    </label>
                    <textarea
                      rows={5}
                      value={pSystem}
                      onChange={(e) => setPSystem(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#c2a672] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-400">江湖背景修真大纲 (Scenario)</label>
                    <textarea
                      rows={2}
                      value={pScenario}
                      onChange={(e) => setPScenario(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-400">言语气度示范 (Dialogue Example)</label>
                    <textarea
                      rows={2}
                      value={pExample}
                      onChange={(e) => setPExample(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672] resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-dashed border-[#c2a672]/30 text-xs text-[#c2a672] hover:bg-[#2c2a27] cursor-pointer transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      <span>导入酒馆说书人 (.json)</span>
                      <input type="file" accept=".json" onChange={handlePresetUpload} className="hidden" />
                    </label>

                    <button
                      onClick={handleUpdatePresetDetails}
                      className="px-4 py-2 bg-neutral-900 border border-[#c2a672]/40 text-[#c2a672] hover:bg-[#c2a672] hover:text-black font-brush font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" /> 保 存 说 书 人
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-brush text-base text-neutral-100">天演大罗星轨 (LLM API 设置)</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">调和天地灵气的流速与广度，配置底层的 LLM 引擎</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-400">模型 API 来源</label>
                      <select
                        value={apiType}
                        onChange={(e) => setApiType(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#c2a672]"
                      >
                        <option value="gemini">Gemini API (服务器安全代理)</option>
                        <option value="sillytavern">SillyTavern Proxy API</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-400">大天演温度 (Temperature: {temp})</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.5"
                        step="0.05"
                        value={temp}
                        onChange={(e) => setTemp(parseFloat(e.target.value))}
                        className="w-full accent-[#c2a672] bg-neutral-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-neutral-400">核概率采样 (Top-P: {topP})</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="w-full accent-[#c2a672] bg-neutral-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-400">
                      自定义全局系统指令覆盖 (留空则默认使用说书人的自带指令)
                    </label>
                    <textarea
                      rows={5}
                      value={systemOverride}
                      onChange={(e) => setSystemOverride(e.target.value)}
                      placeholder="如果您想为所有说书戏目强制添加某些世界法则、属性扣减约束等，请在此输入..."
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#c2a672] resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-neutral-800">
                    <button
                      onClick={handleApplyApiSettings}
                      className="px-4 py-2 bg-neutral-900 border border-[#c2a672]/40 text-[#c2a672] hover:bg-[#c2a672] hover:text-black font-brush font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" /> 应 用 天 律 参 数
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saves' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-brush text-base text-neutral-100">三生石·存档卷轴</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">在此定格时空因果，随时可再度读取，回归旧时造化境界</p>
                </div>

                {/* Slots */}
                <div className="grid grid-cols-2 gap-4">
                  {['1', '2', '3', '4'].map((slot) => {
                    const timeStr = slotTimes[slot];
                    const isEmpty = timeStr === '空置中';
                    return (
                      <div key={slot} className="p-3 border border-[#c2a672]/15 bg-neutral-950 flex flex-col justify-between space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-brush text-sm text-[#c2a672]">存档槽位 #{slot}</span>
                          <span className="text-[9px] font-mono text-neutral-400">{timeStr}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onSaveSlot(slot);
                              // Trigger reload timestamp
                              const t = new Date().toLocaleString();
                              setSlotTimes((prev) => ({ ...prev, [slot]: t }));
                            }}
                            className="flex-1 py-1 bg-[#c2a672]/10 border border-[#c2a672]/30 text-xs font-brush text-[#c2a672] hover:bg-[#c2a672] hover:text-black transition-all cursor-pointer"
                          >
                            定格写入 (Save)
                          </button>
                          <button
                            onClick={() => onLoadSlot(slot)}
                            disabled={isEmpty}
                            className="flex-1 py-1 bg-neutral-900 border border-neutral-800 text-xs font-brush text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:pointer-events-none cursor-pointer"
                          >
                            造化读出 (Load)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dangerous resets */}
                <div className="border-t border-[#8f3434]/20 pt-6 mt-4">
                  <div className="bg-[#8f3434]/5 border border-[#8f3434]/30 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-brush text-sm text-red-400 flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4" /> 劫尽归宗·重置因果
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">
                        该操作将永远清空您所有的聊天历史、断代快照以及所有修行变动数值（世界书及说书人设定会予以保留）！
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        const confirm = window.confirm('云少侠，当真要将所有前尘缘法付之一炬，重回一介凡骨开局吗？');
                        if (confirm) {
                          await onResetGame();
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 bg-[#8f3434]/20 border border-[#8f3434]/50 hover:bg-[#8f3434] hover:text-white text-red-300 font-brush text-xs tracking-wider transition-all cursor-pointer"
                    >
                      天劫重置本尊
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
