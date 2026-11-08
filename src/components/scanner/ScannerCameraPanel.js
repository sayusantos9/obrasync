import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';

import { CameraView } from 'expo-camera';
import {useEffect,useState} from 'react';
import {AppState,ActivityIndicator,View as NativeView} from 'react-native';

import { scannerStyles as styles } from './scannerStyles';
import {useInventoryTheme} from '../layout/InventoryScreen';
import { BARCODE_TYPES } from '../../utils/scanner';

export function ScannerCameraPanel({
  hasPermission,
  isFlashEnabled,
  isScanned,
  onBarcodeScanned,
  onToggleFlash,
}) {
  const theme=useInventoryTheme();
  const [previewWidth,setPreviewWidth]=useState(0);
  const [active,setActive]=useState(AppState.currentState==='active'),[ready,setReady]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>{setActive(state==='active');setReady(false);setError('');});return()=>listener.remove();},[]);
  useEffect(()=>{
    if(!active||!hasPermission||!previewWidth||ready||error)return;
    const timeout=setTimeout(()=>setError('A câmera não iniciou. Toque em Tentar novamente. Se continuar, confira a permissão e se outro aplicativo está usando a câmera.'),12000);
    return()=>clearTimeout(timeout);
  },[active,hasPermission,previewWidth,ready,error,attempt]);
  if (!hasPermission) {
    return (
      <View style={styles.cameraArea}>
        <View style={styles.permissionPanel}>
          <Ionicons name="camera-outline" size={62} color={theme.colors.accent} />
          <Text style={styles.permissionTitle}>A câmera é necessária</Text>
          <Text style={styles.permissionText}>
            O ObraSync usa a câmera somente para identificar materiais, pedidos e
            movimentações do estoque.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <NativeView collapsable={false} onLayout={({nativeEvent})=>setPreviewWidth(Math.round(nativeEvent.layout.width))} style={[styles.cameraArea,{backgroundColor:'transparent',borderRadius:0,overflow:'visible'}]}>
      {active&&!error&&previewWidth>0&&<CameraView
        key={`${attempt}:${previewWidth}`}
        style={{width:previewWidth,height:440}}
        facing="back"
        mode="picture"
        onCameraReady={()=>{setReady(true);setError('');}}
        onMountError={event=>{setReady(false);setError(event.message||'Não foi possível abrir a câmera.');}}
        enableTorch={active&&ready&&isFlashEnabled}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={isScanned||!ready ? undefined : onBarcodeScanned}
      />}

      <NativeView style={[styles.overlay,{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'transparent'}]} pointerEvents="box-none">
       {!ready&&!error&&<ActivityIndicator color="#FFFFFF" accessibilityLabel="Iniciando câmera"/>}
       {!!error?<View style={{padding:16}}><Text style={styles.permissionTitle}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={()=>{setError('');setReady(false);setAttempt(value=>value+1);}} style={{padding:16,backgroundColor:'#0066BE',borderRadius:12,marginTop:16}}><Text style={{color:'white'}}>Tentar novamente</Text></TouchableOpacity></View>:<>
        <View style={[styles.scanFrame,{height:220}]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.cameraHint}>
          {isScanned ? 'Código identificado' : 'Posicione o código dentro da área'}
        </Text>
        <Text style={styles.cameraSubtext}>QR Code e códigos de barras compatíveis</Text>

        <NativeView style={{flexDirection:'row',alignItems:'center',gap:12}}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={isFlashEnabled?'Desligar lanterna':'Ligar lanterna'} disabled={!ready} style={[styles.flashButton,{opacity:ready?1:0.4}]} onPress={onToggleFlash}>
          <Ionicons
            name={isFlashEnabled ? 'flash' : 'flash-outline'}
            size={23}
            color={isFlashEnabled ? theme.colors.accent : '#FFFFFF'}
          />
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reiniciar prévia da câmera" onPress={()=>{setReady(false);setError('');setAttempt(value=>value+1);}} style={{padding:10,backgroundColor:'#010028',borderRadius:8,marginTop:8}}><Text style={{color:'#FFFFFF',fontSize:12}}>Reiniciar câmera</Text></TouchableOpacity>
        </NativeView>
       </>}
      </NativeView>
    </NativeView>
  );
}
