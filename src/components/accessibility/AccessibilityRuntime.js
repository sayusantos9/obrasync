import {createContext} from 'react';
import {DEFAULT_ACCESSIBILITY} from '../../utils/accessibility';
export const VisualSettingsContext=createContext(DEFAULT_ACCESSIBILITY);
export const ReadingInteractionContext=createContext({mode:null,read:()=>{}});
export const InsideActionContext=createContext(false);
