import React,{forwardRef,useContext} from 'react';
import * as Native from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {VisualSettingsContext,ReadingInteractionContext,InsideActionContext} from './AccessibilityRuntime';
import {visualColor,textAdjustments} from '../../utils/accessibility';

function content(c){if(typeof c==='string'||typeof c==='number')return String(c);if(Array.isArray(c))return c.map(content).join(' ');return React.isValidElement(c)?content(c.props.children):'';}
function surface(style,s){const flat=Native.StyleSheet.flatten(style)||{};return [style,flat.backgroundColor?{backgroundColor:visualColor(flat.backgroundColor,s)}:null,flat.borderColor?{borderColor:visualColor(flat.borderColor,s,'border')}:null];}
const wrap=(Component,{action=false,input=false,image=false,scroll=false}={})=>forwardRef(function AccessibleComponent({style,children,onPress,onLongPress,...props},ref){
 const s=useContext(VisualSettingsContext),reader=useContext(ReadingInteractionContext);
 const adjusted=state=>{
  const original=typeof style==='function'?style(state):style,flat=Native.StyleSheet.flatten(original)||{};
  return [surface(original,s),input?{...textAdjustments(flat,s),...(s.readableFont?{fontFamily:Native.Platform.OS==='ios'?'System':'sans-serif'}:{}),color:visualColor(flat.color||'#202020',s,'text')}:null,
   action&&s.buttonLevel?{minWidth:44+s.buttonLevel*4,minHeight:44+s.buttonLevel*4,...(typeof flat.height==='number'&&flat.height<44+s.buttonLevel*4?{height:44+s.buttonLevel*4}:{})}:null];
 };
 const label=props.accessibilityLabel||content(children);
 const extra=action?{onPress,onLongPress:reader.mode&&label?()=>reader.read(label):onLongPress,delayLongPress:450,hitSlop:s.buttonLevel?Math.min(12,s.buttonLevel*4):props.hitSlop}:{};
 if(input)extra.placeholderTextColor=visualColor(props.placeholderTextColor||'#686C78',s,'text');
 if(scroll)extra.contentContainerStyle=surface(props.contentContainerStyle,s);
 const actionChildren=c=><InsideActionContext.Provider value={props.accessibilityRole||'button'}>{c}</InsideActionContext.Provider>;
 const node=<Component {...props} {...extra} ref={ref} style={typeof style==='function'?adjusted:adjusted()}>{action?(typeof children==='function'?state=>actionChildren(children(state)):actionChildren(children)):children}</Component>;
 return image&&s.imageCaptions&&props.accessibilityLabel?<Native.View>{node}<Native.Text style={{fontSize:14,padding:4,color:visualColor('#202020',s,'text')}}>{props.accessibilityLabel}</Native.Text></Native.View>:node;
});
export const AccessibleView=wrap(Native.View);
export const AccessibleTouchableOpacity=wrap(Native.TouchableOpacity,{action:true});
export const AccessiblePressable=wrap(Native.Pressable,{action:true});
export const AccessibleTextInput=wrap(Native.TextInput,{input:true});
AccessibleTextInput.State=Native.TextInput.State;
export const AccessibleScrollView=wrap(Native.ScrollView,{scroll:true});
export const AccessibleImage=wrap(Native.Image,{image:true});
export const AccessibleFlatList=wrap(Native.FlatList,{scroll:true});
export const AccessibleSafeAreaView=wrap(SafeAreaView);
export const AccessibleModal=forwardRef(function AccessibleModal(props,ref){const s=useContext(VisualSettingsContext);return <Native.Modal {...props} ref={ref} animationType={s.reduceMotion?'none':props.animationType}/>;});
export const AccessibleIonicons=forwardRef(function AccessibleIonicons({color,...props},ref){const s=useContext(VisualSettingsContext);return <Ionicons {...props} ref={ref} color={visualColor(color,s,'text')}/>;});
