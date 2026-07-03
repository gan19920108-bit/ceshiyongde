import { useState, useEffect, useCallback, useRef } from 'react';
import { db, seedDatabase } from '../sillytavern/database';
import { 
  Lorebook, CharacterPreset, SillyTavernSettings, TavernFloorSnapshot, 
  ParsedStream, StreamParser, LorebookEngine, PromptAssembler, VarsMerger,
  SillyTavernImporter
} from '../sillytavern';
import { Character, Skill, InventoryItem, Relation, Quest, GameTime, TavernMessage } from '../types';
import { 
  INITIAL_CHARACTER, INITIAL_SKILLS, INITIAL_INVENTORY, 
  INITIAL_RELATIONS, INITIAL_QUESTS, INITIAL_TIME 
} from '../data';

export function useSillytavern() {
  // Game States
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [relations, setRelations] = useState<Relation[]>(INITIAL_RELATIONS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [time, setTime] = useState<GameTime>(INITIAL_TIME);
  const [messages, setMessages] = useState<TavernMessage[]>([]);

  // SillyTavern Settings & Collections
  const [settings, setSettings] = useState<SillyTavernSettings>({
    activeLorebooks: ['lore_world'],
    selectedPresetId: 'preset_taiwu',
    secondaryApiEnabled: false,
    systemInstructionOverride: '',
    customTags: ['thinking', 'maintext', 'option', 'sum', 'vars'],
    temperature: 0.8,
    topP: 0.95,
    maxContextLength: 4000,
  });

  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [activePreset, setActivePreset] = useState<CharacterPreset | null>(null);

  // Streaming / Progress States
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingStream, setThinkingStream] = useState('');
  const [maintextStream, setMaintextStream] = useState('');
  const [optionsStream, setOptionsStream] = useState<string[]>([]);
  const [sumStream, setSumStream] = useState('');
  const [varsStream, setVarsStream] = useState<Record<string, any>>({});
  
  // UI Toast notification state
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'warn' | 'info' }[]>([]);

  const addNotification = useCallback((text: string, type: 'success' | 'warn' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  // Initialize database & load configurations
  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
        
        // Load presets and lorebooks
        const loadedPresets = await db.presets.toArray();
        const loadedLores = await db.lorebooks.toArray();
        
        setPresets(loadedPresets);
        setLorebooks(loadedLores);

        // Load active preset
        const activeId = localStorage.getItem('st_selected_preset_id') || 'preset_taiwu';
        const preset = loadedPresets.find((p) => p.id === activeId) || loadedPresets[0] || null;
        setActivePreset(preset);

        // Load settings
        const storedSettings = localStorage.getItem('st_settings');
        if (storedSettings) {
          try {
            setSettings(JSON.parse(storedSettings));
          } catch (e) {
            // Use defaults
          }
        }

        // Load game save slot or use first message
        const savedGame = localStorage.getItem('st_game_autosave');
        if (savedGame) {
          const parsed = JSON.parse(savedGame);
          if (parsed.character) setCharacter(parsed.character);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.inventory) setInventory(parsed.inventory);
          if (parsed.relations) setRelations(parsed.relations);
          if (parsed.quests) setQuests(parsed.quests);
          if (parsed.time) setTime(parsed.time);
          if (parsed.messages) setMessages(parsed.messages);
        } else if (preset) {
          // Initialize first message from preset
          const firstMsg: TavernMessage = {
            id: 'msg_first',
            sender: 'narrator',
            senderName: preset.charName,
            text: preset.firstMes,
            timestamp: `${INITIAL_TIME.shichen} ${INITIAL_TIME.location}`,
          };
          setMessages([firstMsg]);
          
          // Save an initial floor state snapshot for the first message
          const initialSnapshot: TavernFloorSnapshot = {
            messageId: firstMsg.id,
            character: INITIAL_CHARACTER,
            skills: INITIAL_SKILLS,
            inventory: INITIAL_INVENTORY,
            relations: INITIAL_RELATIONS,
            quests: INITIAL_QUESTS,
            time: INITIAL_TIME,
          };
          await db.floorSnapshots.put(initialSnapshot);
        }
      } catch (err) {
        console.error('Failed to initialize SillyTavern database:', err);
      }
    };
    init();
  }, []);

  // Save game to autosave when state changes
  useEffect(() => {
    if (messages.length > 0) {
      const saveData = { character, skills, inventory, relations, quests, time, messages };
      localStorage.setItem('st_game_autosave', JSON.stringify(saveData));
    }
  }, [character, skills, inventory, relations, quests, time, messages]);

  // Persist settings changes
  const saveSettings = (newSettings: SillyTavernSettings) => {
    setSettings(newSettings);
    localStorage.setItem('st_settings', JSON.stringify(newSettings));
  };

  // Switch character preset
  const changePreset = async (presetId: string) => {
    const selected = presets.find((p) => p.id === presetId);
    if (!selected) return;

    setActivePreset(selected);
    localStorage.setItem('st_selected_preset_id', presetId);
    saveSettings({ ...settings, selectedPresetId: presetId });

    // Reset game messages and state to start fresh with this character
    setCharacter(INITIAL_CHARACTER);
    setSkills(INITIAL_SKILLS);
    setInventory(INITIAL_INVENTORY);
    setRelations(INITIAL_RELATIONS);
    setQuests(INITIAL_QUESTS);
    setTime(INITIAL_TIME);

    const firstMsg: TavernMessage = {
      id: `msg_first_${Date.now()}`,
      sender: 'narrator',
      senderName: selected.charName,
      text: selected.firstMes,
      timestamp: `${INITIAL_TIME.shichen} ${INITIAL_TIME.location}`,
    };
    setMessages([firstMsg]);

    const initialSnapshot: TavernFloorSnapshot = {
      messageId: firstMsg.id,
      character: INITIAL_CHARACTER,
      skills: INITIAL_SKILLS,
      inventory: INITIAL_INVENTORY,
      relations: INITIAL_RELATIONS,
      quests: INITIAL_QUESTS,
      time: INITIAL_TIME,
    };
    await db.floorSnapshots.put(initialSnapshot);
    addNotification(`已切换说书人至 【${selected.charName}】，开启全新篇章！`, 'success');
  };

  // --- CORE GAMEPLAY GENERATION: sendGameMessage ---
  const sendGameMessage = async (userInput: string) => {
    if (!userInput || userInput.trim() === '' || isGenerating) return;

    setIsGenerating(true);
    setThinkingStream('');
    setMaintextStream('');
    setOptionsStream([]);
    setSumStream('');
    setVarsStream({});

    // 1. Create player message
    const playerMsgId = `msg_player_${Date.now()}`;
    const timestamp = `${time.shichen} ${time.location}`;
    const playerMsg: TavernMessage = {
      id: playerMsgId,
      sender: 'player',
      senderName: '云长风',
      text: userInput,
      timestamp,
    };

    // Store state before sending message, associated with playerMsgId
    const playerSnapshot: TavernFloorSnapshot = {
      messageId: playerMsgId,
      character,
      skills,
      inventory,
      relations,
      quests,
      time,
    };
    await db.floorSnapshots.put(playerSnapshot);

    const updatedMessages = [...messages, playerMsg];
    setMessages(updatedMessages);

    // 2. Scan lorebook for keywords
    // Combine current user input and recent story context for keyword matching
    const contextToScan = userInput + ' ' + messages.slice(-2).map((m) => m.text).join(' ');
    const matchedLore = await LorebookEngine.scanAndMatch(contextToScan, settings.activeLorebooks);
    const loreText = LorebookEngine.formatMatchedLore(matchedLore);

    if (matchedLore.length > 0) {
      addNotification(`【世界书触发】契合词: ${matchedLore.map((e) => e.keys[0]).join(', ')}`, 'info');
    }

    // 3. Assemble full instruction prompt
    const fullPrompt = PromptAssembler.assemble({
      preset: activePreset!,
      lorebookContent: loreText,
      character,
      skills,
      inventory,
      relations,
      quests,
      time,
      recentHistory: updatedMessages.slice(-10), // feed last 10 messages
      userInput,
      customSystemInstructions: settings.systemInstructionOverride || undefined,
    });

    // 4. Call api endpoints with streaming or typewriter simulation
    const aiMsgId = `msg_ai_${Date.now()}`;
    let completeAiText = '';

    try {
      // First try real server SSE streaming
      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          apiType: localStorage.getItem('setting_apiType') || 'gemini',
          temperature: settings.temperature,
          topP: settings.topP,
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming failed, falling back to static');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('No reader found on stream body');
      }

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Save the last incomplete line back to buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                completeAiText += parsed.chunk;
                
                // Parse on the fly
                const streamResult = StreamParser.parse(completeAiText);
                setThinkingStream(streamResult.thinking);
                setMaintextStream(streamResult.maintext);
                setOptionsStream(streamResult.options);
                setSumStream(streamResult.sum);
                setVarsStream(streamResult.vars);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
    } catch (streamErr) {
      // Stream failed or unsupported, fall back to standard POST /api/generate
      console.warn('Streaming failed, fallback to normal api generation:', streamErr);
      try {
        const fallbackRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: fullPrompt,
            apiType: localStorage.getItem('setting_apiType') || 'gemini',
          }),
        });

        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json();
          throw new Error(errData.error || '天演机杼受阻，生成失败！');
        }

        const fallbackData = await fallbackRes.json();
        completeAiText = fallbackData.reply || '';

        // Simulate streaming typewriter effect for excellent UX
        let currentTyped = '';
        const stepSize = Math.max(1, Math.floor(completeAiText.length / 50)); // divide into 50 typewriter steps
        
        for (let i = 0; i < completeAiText.length; i += stepSize) {
          currentTyped = completeAiText.substring(0, i + stepSize);
          const streamResult = StreamParser.parse(currentTyped);
          setThinkingStream(streamResult.thinking);
          setMaintextStream(streamResult.maintext);
          setOptionsStream(streamResult.options);
          setSumStream(streamResult.sum);
          setVarsStream(streamResult.vars);
          // Yield to UI
          await new Promise((resolve) => setTimeout(resolve, 15));
        }

        // Final perfect parse
        const finalResult = StreamParser.parse(completeAiText);
        setThinkingStream(finalResult.thinking);
        setMaintextStream(finalResult.maintext);
        setOptionsStream(finalResult.options);
        setSumStream(finalResult.sum);
        setVarsStream(finalResult.vars);
      } catch (err: any) {
        addNotification(`天演算力紊乱：${err.message}`, 'warn');
        setIsGenerating(false);
        return;
      }
    }

    // 5. Final Processing of parsed variables and message creation
    const finalParsed = StreamParser.parse(completeAiText);
    
    // Create final narrator message
    const aiMessage: TavernMessage = {
      id: aiMsgId,
      sender: 'narrator',
      senderName: activePreset!.charName,
      text: finalParsed.maintext || completeAiText,
      timestamp,
    };

    setMessages((prev) => [...prev, aiMessage]);

    // 6. Merge Variables and apply to state
    if (finalParsed.vars && Object.keys(finalParsed.vars).length > 0) {
      const mergedResult = VarsMerger.merge(
        finalParsed.vars,
        { character, skills, inventory, relations, quests, time },
        addNotification
      );
      setCharacter(mergedResult.character);
      setSkills(mergedResult.skills);
      setInventory(mergedResult.inventory);
      setRelations(mergedResult.relations);
      setQuests(mergedResult.quests);
      setTime(mergedResult.time);

      // Save a floor state snapshot associated with the final AI message
      const finalSnapshot: TavernFloorSnapshot = {
        messageId: aiMsgId,
        character: mergedResult.character,
        skills: mergedResult.skills,
        inventory: mergedResult.inventory,
        relations: mergedResult.relations,
        quests: mergedResult.quests,
        time: mergedResult.time,
      };
      await db.floorSnapshots.put(finalSnapshot);
    } else {
      // Just save the current state snapshot
      const finalSnapshot: TavernFloorSnapshot = {
        messageId: aiMsgId,
        character,
        skills,
        inventory,
        relations,
        quests,
        time,
      };
      await db.floorSnapshots.put(finalSnapshot);
    }

    setIsGenerating(false);
  };

  // --- FLOORS Snapshots Rollback (Jump Back) ---
  const restoreToFloor = async (messageId: string) => {
    const snapshot = await db.floorSnapshots.get(messageId);
    if (!snapshot) {
      addNotification('未能检索到该回合的天理断代（快照），无法回溯！', 'warn');
      return;
    }

    // Find message index to truncate chat history after this message
    const index = messages.findIndex((m) => m.id === messageId);
    if (index === -1) {
      addNotification('消息记录不存在，无法定位回溯时刻！', 'warn');
      return;
    }

    // Confirm restore
    setCharacter(snapshot.character);
    setSkills(snapshot.skills);
    setInventory(snapshot.inventory);
    setRelations(snapshot.relations);
    setQuests(snapshot.quests);
    setTime(snapshot.time);
    
    // Truncate messages to this point (keeping the target message)
    setMessages(messages.slice(0, index + 1));
    addNotification(`【功满回天】时空倒卷！成功回溯到该历史楼层，属性、包囊与时历皆已复位。`, 'success');
  };

  // --- CHARACTER CULTIVATION BREAKTHROUGH SYSTEM ---
  const triggerBreakthrough = () => {
    if (character.exp < character.maxExp) {
      addNotification('修行火候未到！请继续行走江湖、推演剧情以汲取天机经验。', 'warn');
      return;
    }

    // Determine next phase and stats boost
    const phases = [
      '筑基初期', '筑基中期', '筑基后期', 
      '金丹初期', '金丹中期', '金丹后期', 
      '元婴初期', '元婴中期', '元婴后期', 
      '化神初期', '化神中期', '化神封神'
    ];
    const currentIdx = phases.indexOf(character.phase);
    let nextPhase = '化神封神';
    if (currentIdx !== -1 && currentIdx < phases.length - 1) {
      nextPhase = phases[currentIdx + 1];
    } else if (currentIdx === -1) {
      nextPhase = '筑基中期'; // fallback
    }

    // Experience consumption & overflow
    const excessExp = character.exp - character.maxExp;
    const nextMaxExp = Math.floor(character.maxExp * 1.5);

    // Increase Max Stats
    const hpBoost = 100;
    const mpBoost = 50;
    
    const boostedStats = {
      strength: character.stats.strength + 5,
      agility: character.stats.agility + 5,
      constitution: character.stats.constitution + 5,
      comprehension: character.stats.comprehension + 5,
      charisma: character.stats.charisma + 2,
      luck: character.stats.luck + 1,
    };

    setCharacter((prev) => ({
      ...prev,
      phase: nextPhase,
      exp: excessExp,
      maxExp: nextMaxExp,
      maxHp: prev.maxHp + hpBoost,
      hp: prev.maxHp + hpBoost, // fully heal on level up!
      maxMp: prev.maxMp + mpBoost,
      mp: prev.maxMp + mpBoost,
      stats: boostedStats,
      reputation: prev.reputation + 100,
    }));

    addNotification(`🎉【羽化登仙】天劫散尽！你成功突破至 【${nextPhase}】境界！最大气血+${hpBoost}，最大真气+${mpBoost}，各项属性大幅跃升！`, 'success');
  };

  // --- MANUAL SAVES / LOADS SLOT ---
  const saveGameToSlot = (slot: string) => {
    const saveData = { character, skills, inventory, relations, quests, time, messages };
    localStorage.setItem(`game_save_${slot}`, JSON.stringify(saveData));
    localStorage.setItem(`game_save_time_${slot}`, new Date().toLocaleString());
    addNotification(`天演存档成功！已保存至 【槽位 ${slot}】。`, 'success');
  };

  const loadGameFromSlot = (slot: string) => {
    const savedStr = localStorage.getItem(`game_save_${slot}`);
    if (!savedStr) {
      addNotification(`【槽位 ${slot}】尚无天演存档，无法读取！`, 'warn');
      return;
    }
    try {
      const parsed = JSON.parse(savedStr);
      if (parsed.character) setCharacter(parsed.character);
      if (parsed.skills) setSkills(parsed.skills);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.relations) setRelations(parsed.relations);
      if (parsed.quests) setQuests(parsed.quests);
      if (parsed.time) setTime(parsed.time);
      if (parsed.messages) setMessages(parsed.messages);
      addNotification(`功法读档成功！已加载 【槽位 ${slot}】。`, 'success');
    } catch (e) {
      addNotification('加载存档失败，命途可能已受损！', 'warn');
    }
  };

  // Reset Game
  const resetGame = async () => {
    setCharacter(INITIAL_CHARACTER);
    setSkills(INITIAL_SKILLS);
    setInventory(INITIAL_INVENTORY);
    setRelations(INITIAL_RELATIONS);
    setQuests(INITIAL_QUESTS);
    setTime(INITIAL_TIME);
    
    if (activePreset) {
      const firstMsg: TavernMessage = {
        id: `msg_first_${Date.now()}`,
        sender: 'narrator',
        senderName: activePreset.charName,
        text: activePreset.firstMes,
        timestamp: `${INITIAL_TIME.shichen} ${INITIAL_TIME.location}`,
      };
      setMessages([firstMsg]);

      const initialSnapshot: TavernFloorSnapshot = {
        messageId: firstMsg.id,
        character: INITIAL_CHARACTER,
        skills: INITIAL_SKILLS,
        inventory: INITIAL_INVENTORY,
        relations: INITIAL_RELATIONS,
        quests: INITIAL_QUESTS,
        time: INITIAL_TIME,
      };
      await db.floorSnapshots.clear(); // clear old backtracking
      await db.floorSnapshots.put(initialSnapshot);
    }
    addNotification('太极浑圆，劫尽归零！一切因果数值已恢复初始。', 'info');
  };

  // --- LOREBOOKS MANAGEMENT CRUD ---
  const handleUpdateLorebook = async (updated: Lorebook) => {
    await db.lorebooks.put(updated);
    setLorebooks(await db.lorebooks.toArray());
  };

  const handleImportLorebook = async (jsonStr: string) => {
    try {
      const imported = SillyTavernImporter.parseLorebook(jsonStr);
      await db.lorebooks.add(imported);
      setLorebooks(await db.lorebooks.toArray());
      addNotification(`【世界书导入成功】已加载 “${imported.name}”，包含 ${imported.entries.length} 条设定。`, 'success');
    } catch (err: any) {
      addNotification(`世界书导入失败：${err.message}`, 'warn');
    }
  };

  // --- PRESETS MANAGEMENT CRUD ---
  const handleUpdatePreset = async (updated: CharacterPreset) => {
    await db.presets.put(updated);
    setPresets(await db.presets.toArray());
    if (activePreset && activePreset.id === updated.id) {
      setActivePreset(updated);
    }
  };

  const handleImportPreset = async (jsonStr: string) => {
    try {
      const imported = SillyTavernImporter.parsePreset(jsonStr);
      await db.presets.add(imported);
      setPresets(await db.presets.toArray());
      addNotification(`【说书人导入成功】已添加新角色 “${imported.charName}”。`, 'success');
    } catch (err: any) {
      addNotification(`说书人导入失败：${err.message}`, 'warn');
    }
  };

  return {
    // Game state
    character, setCharacter,
    skills, setSkills,
    inventory, setInventory,
    relations, setRelations,
    quests, setQuests,
    time, setTime,
    messages, setMessages,

    // SillyTavern states & collections
    settings, saveSettings,
    presets, setPresets,
    lorebooks, setLorebooks,
    activePreset, changePreset,

    // Stream status
    isGenerating,
    thinkingStream,
    maintextStream,
    optionsStream,
    sumStream,
    varsStream,

    // Notification
    notifications,
    addNotification,

    // Game Actions
    sendGameMessage,
    restoreToFloor,
    triggerBreakthrough,
    saveGameToSlot,
    loadGameFromSlot,
    resetGame,

    // Lorebook / Preset actions
    handleUpdateLorebook,
    handleImportLorebook,
    handleUpdatePreset,
    handleImportPreset,
  };
}
