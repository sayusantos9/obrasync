import {Keyboard} from 'react-native';
import {useRef,useState} from 'react';
import {SCREENS,TABS} from '../navigation/routes';

export function useAppNavigation(){
 const [route,setRoute]=useState({screen:SCREENS.TABS,tab:TABS.HOME});
 const routeRef=useRef(route),history=useRef([]);
 function apply(next){routeRef.current=next;setRoute(next);}
 function navigate(next){
  Keyboard.dismiss();const current=routeRef.current;
  if(next.screen===current.screen&&next.tab===current.tab)return;
  history.current=[...history.current.slice(-9),current];apply(next);
 }
 function selectTab(tab){navigate({screen:SCREENS.TABS,tab});}
 function openScreen(screen,params={}){if(screen)navigate({...routeRef.current,screen,params});}
 function goBack(){Keyboard.dismiss();apply(history.current.pop()||{screen:SCREENS.TABS,tab:TABS.HOME});}
 function resetNavigation(){Keyboard.dismiss();history.current=[];apply({screen:SCREENS.TABS,tab:TABS.HOME});}
 return {activeTab:route.tab,currentScreen:route.screen,currentScreenParams:route.params||{},selectTab,openScreen,goBack,resetNavigation};
}
