import { useRef, useState } from 'react';
import { SCREENS, TABS } from '../navigation/routes';

const MAX_HISTORY_LENGTH = 10;

export function useAppNavigation() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.TABS);
  const screenHistoryRef = useRef([]);

  function selectTab(tabId) {
    screenHistoryRef.current = [];
    setActiveTab(tabId);
    setCurrentScreen(SCREENS.TABS);
  }

  function openScreen(screenId) {
    if (!screenId || screenId === currentScreen) return;

    screenHistoryRef.current = [
      ...screenHistoryRef.current.slice(-(MAX_HISTORY_LENGTH - 1)),
      currentScreen,
    ];
    setCurrentScreen(screenId);
  }

  function goBack() {
    setCurrentScreen(screenHistoryRef.current.pop() ?? SCREENS.TABS);
  }

  return {
    activeTab,
    screen: currentScreen,
    selectTab,
    openScreen,
    goBack,
  };
}
