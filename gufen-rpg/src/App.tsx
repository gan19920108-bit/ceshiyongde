import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { INITIAL_LOCATIONS, INITIAL_EVENTS } from './data';
import { useSillytavern } from './hooks/useSillytavern';
import GameView from './components/SillyTavern/GameView';
import NavbarModal from './components/NavbarModal';

export default function App() {
  const st = useSillytavern();
  const [activeModalTab, setActiveModalTab] = useState<string | null>(null);

  // Bridging helper for NavbarModal to add notifications/messages if needed
  const addTavernMessageBridge = (sender: 'player' | 'narrator' | 'npc', senderName: string, text: string) => {
    const timestamp = `${st.time.shichen} ${st.time.location}`;
    st.setMessages((prev) => [
      ...prev,
      {
        id: `msg_modal_${Date.now()}`,
        sender,
        senderName,
        text,
        timestamp,
      },
    ]);
  };

  return (
    <div id="app_frame_container" className="w-full h-screen bg-[#121110] text-[#dfdbd3] overflow-hidden select-none">
      
      {/* SillyTavern main immersive screen */}
      <GameView
        character={st.character}
        time={st.time}
        messages={st.messages}
        skills={st.skills}
        inventory={st.inventory}
        relations={st.relations}
        quests={st.quests}
        settings={st.settings}
        presets={st.presets}
        lorebooks={st.lorebooks}
        activePreset={st.activePreset}
        isGenerating={st.isGenerating}
        thinkingStream={st.thinkingStream}
        maintextStream={st.maintextStream}
        optionsStream={st.optionsStream}
        notifications={st.notifications}
        addNotification={st.addNotification}
        sendGameMessage={st.sendGameMessage}
        restoreToFloor={st.restoreToFloor}
        triggerBreakthrough={st.triggerBreakthrough}
        saveSettings={st.saveSettings}
        changePreset={st.changePreset}
        onUpdatePreset={st.handleUpdatePreset}
        onImportPreset={st.handleImportPreset}
        onUpdateLorebook={st.handleUpdateLorebook}
        onImportLorebook={st.handleImportLorebook}
        onSaveSlot={st.saveGameToSlot}
        onLoadSlot={st.loadGameFromSlot}
        onResetGame={st.resetGame}
        onOpenModalTab={(tabId) => setActiveModalTab(tabId)}
        setMessages={st.setMessages}
      />

      {/* 2. Standard game secondary systems (Status Sheets, Backpack, Map, System Store) */}
      <AnimatePresence>
        {activeModalTab && (
          <NavbarModal
            activeTab={activeModalTab}
            onClose={() => setActiveModalTab(null)}
            character={st.character}
            setCharacter={st.setCharacter}
            inventory={st.inventory}
            setInventory={st.setInventory}
            skills={st.skills}
            setSkills={st.setSkills}
            mapLocations={INITIAL_LOCATIONS}
            relations={st.relations}
            setRelations={st.setRelations}
            quests={st.quests}
            setQuests={st.setQuests}
            worldEvents={INITIAL_EVENTS}
            time={st.time}
            setTime={st.setTime}
            addNotification={st.addNotification}
            addTavernMessage={addTavernMessageBridge}
            
            fontSize="font-serif"
            setFontSize={() => {}}
            colorScheme="classic-ink"
            setColorScheme={() => {}}
            responseLength="medium"
            setResponseLength={() => {}}
            apiType={localStorage.getItem('setting_apiType') || 'gemini'}
            setApiType={(val) => localStorage.setItem('setting_apiType', val)}
            sillyTavernUrl=""
            setSillyTavernUrl={() => {}}
            sillyTavernKey=""
            setSillyTavernKey={() => {}}
            onResetGame={st.resetGame}
            saveGameToSlot={st.saveGameToSlot}
            loadGameFromSlot={st.loadGameFromSlot}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
