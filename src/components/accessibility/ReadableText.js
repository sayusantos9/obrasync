import React,{createContext,forwardRef,useContext,useEffect,useRef} from 'react';
import {Text,StyleSheet,Platform} from 'react-native';
import {VisualSettingsContext,ReadingInteractionContext,InsideActionContext} from './AccessibilityRuntime';
import {textAdjustments,visualColor} from '../../utils/accessibility';

// Only rendered labels are registered. TextInput values (including passwords) are never read.
export const TextRegistryContext=createContext(null);
export function readableContent(children){
 if(typeof children==='string'||typeof children==='number')return String(children);
 if(Array.isArray(children))return children.map(readableContent).join('');
 if(React.isValidElement(children)&&children.props.children)return readableContent(children.props.children);
 return '';
}
export const ReadableText=forwardRef(function ReadableText({children,...props},forwardedRef){
 const registry=useContext(TextRegistryContext),native=useRef(null),id=useRef(Symbol('text'));
 const content=readableContent(children).trim();
 const holdTimer=useRef(null),touchOrigin=useRef(null),didRead=useRef(false);
 const settings=useContext(VisualSettingsContext),reader=useContext(ReadingInteractionContext),insideAction=useContext(InsideActionContext);
 const flat=StyleSheet.flatten(props.style)||{},role=props.accessibilityRole||(insideAction==='link'?'link':flat.fontSize>=21?'header':undefined);
 const changes=textAdjustments(flat,settings,role);
 if(settings.readableFont)changes.fontFamily=Platform.OS==='ios'?'System':'sans-serif';
 if(flat.color||settings.contrast!=='original'&&settings.contrast||settings.textColor)changes.color=visualColor(flat.color||'#202020',settings,'text');
 if(role==='header'&&settings.titleColor)changes.color=settings.titleColor;
 const canRead=!!reader.mode&&!insideAction&&!!content;
 function cancelHold(){clearTimeout(holdTimer.current);}
 function beginHold(event){if(!canRead)return;cancelHold();didRead.current=false;const e=event.nativeEvent;touchOrigin.current={x:e.pageX,y:e.pageY};holdTimer.current=setTimeout(()=>{didRead.current=true;reader.read(content);},450);}
 function moveHold(event){const e=event.nativeEvent,o=touchOrigin.current;if(o&&(Math.abs(e.pageX-o.x)>10||Math.abs(e.pageY-o.y)>10))cancelHold();}
 useEffect(()=>()=>cancelHold(),[reader.mode,content]);
 const gestureProps={onTouchStart:e=>{props.onTouchStart?.(e);beginHold(e);},onTouchMove:e=>{props.onTouchMove?.(e);moveHold(e);},onTouchEnd:e=>{props.onTouchEnd?.(e);cancelHold();},onTouchCancel:cancelHold,...(Platform.OS==='web'?{onMouseDown:beginHold,onMouseMove:moveHold,onMouseUp:cancelHold,onMouseLeave:cancelHold}:{})};
 useEffect(()=>{
  if(!registry||!content||props.accessibilityElementsHidden||props.importantForAccessibility==='no-hide-descendants')return;
  registry.set(id.current,{ref:native,text:content});
  const key=id.current;return()=>registry.delete(key);
 },[registry,content,props.accessibilityElementsHidden,props.importantForAccessibility]);
 return <Text {...props} {...gestureProps} onPress={props.onPress?e=>{if(!didRead.current)props.onPress(e);didRead.current=false;}:undefined} style={[props.style,changes]} ref={node=>{native.current=node;if(typeof forwardedRef==='function')forwardedRef(node);else if(forwardedRef)forwardedRef.current=node;}}>{children}</Text>;
});
