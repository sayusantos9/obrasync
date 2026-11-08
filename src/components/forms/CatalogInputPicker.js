import {useState} from 'react';
import {AccessibleView as View,AccessibleTextInput as Input,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {useApp} from '../../contexts/AppContext';
export function CatalogInputPicker({onSelect,disabled=false,label='Buscar insumo no catálogo'}){
 const [query,setQuery]=useState(''),theme=useInventoryTheme(),{costInputs=[],costInputsError}=useApp();
 const matches=query.trim()?costInputs.filter(i=>`${i.code} ${i.description}`.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))).slice(0,8):[];
 const txt={color:theme.colors.text,fontSize:14};
 return <View style={{marginTop:12}}><Input accessibilityLabel={label} placeholder={label} placeholderTextColor={theme.colors.textMuted} editable={!disabled} value={query} onChangeText={setQuery} style={{...txt,padding:14,minHeight:48,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,backgroundColor:theme.colors.surface}}/>
 {!!costInputsError&&<Text style={txt}>{costInputsError}</Text>}
 {matches.map(i=><Button key={i.source+i.id} accessibilityRole="button" disabled={disabled} onPress={()=>{onSelect(i);setQuery('');}} style={{padding:14,minHeight:48,backgroundColor:theme.colors.primarySoft,marginTop:5,borderRadius:10}}><Text style={txt}>{i.code} · {i.description} ({i.unit})</Text></Button>)}
 {!!query.trim()&&!matches.length&&<Text style={txt}>Nenhum insumo encontrado. Confira o código e a descrição.</Text>}
 </View>;
}
