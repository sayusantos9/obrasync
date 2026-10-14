import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { printMaterialLabel, shareMaterialLabel } from '../services/labelService';
import { labelStyles as S } from './LabelScreen.styles';

export function LabelScreen() {
  const theme = useTheme();
  const qrRef = useRef(null);
  const { createLabel, selectedProject, stock } = useApp();
  const [selectedId, setSelectedId] = useState(stock[0]?.id || '');
  const [generated, setGenerated] = useState(null);
  const [qrBase64, setQrBase64] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => stock.find((item) => item.id === selectedId) || stock[0] || null, [selectedId, stock]);

  useEffect(() => {
    if (!generated?.qr?.payload || !qrRef.current?.toDataURL) return undefined;
    const timer = setTimeout(() => qrRef.current?.toDataURL((value) => setQrBase64(value || '')), 80);
    return () => clearTimeout(timer);
  }, [generated]);

  function select(id) { setSelectedId(id); setGenerated(null); setQrBase64(''); }

  async function generate() {
    if (!selected) { Alert.alert('Estoque vazio', 'Cadastre ou receba um material antes de gerar etiquetas.'); return; }
    setBusy(true); setQrBase64('');
    try {
      const result = await createLabel({ materialCode: selected.code, name: selected.name, unit: selected.unit, location: selected.location, lot: `LOT-${new Date().toISOString().slice(0,10).replaceAll('-','')}` });
      setGenerated(result);
    } catch (error) { Alert.alert('Não foi possível gerar', error.message); }
    finally { setBusy(false); }
  }

  const printable = () => ({
    id: selected.code,
    name: selected.name,
    labelId: generated.label.id,
    lot: generated.label.lot || '-',
    unit: selected.unit || '-',
    location: selected.location || '-',
    receivedAt: new Date(selected.updated_at || Date.now()).toLocaleDateString('pt-BR'),
    projectName: selectedProject.name,
  });
  function ensureQr(){if(!qrBase64) throw new Error('Aguarde o QR Code terminar de carregar.');return qrBase64;}
  async function print(){try{setBusy(true);await printMaterialLabel(printable(),ensureQr());}catch(e){Alert.alert('Erro ao imprimir',e.message)}finally{setBusy(false)}}
  async function share(){try{setBusy(true);const ok=await shareMaterialLabel(printable(),ensureQr());if(!ok)Alert.alert('Compartilhamento indisponível','Use a opção Imprimir/Salvar PDF.');}catch(e){Alert.alert('Erro ao gerar PDF',e.message)}finally{setBusy(false)}}
  const ready=Boolean(generated&&qrBase64);

  return <Screen><ScreenHeader title="Etiquetas QR"/><Scroll><Content>
    <S.Intro>Selecione um material do estoque. O QR Code é gerado localmente e pode ser impresso ou compartilhado em PDF.</S.Intro>
    <S.Selector>{stock.map(entry=><S.Chip accessibilityRole="button" accessibilityState={{selected:entry.id===selected?.id}} key={entry.id} $isActive={entry.id===selected?.id} onPress={()=>select(entry.id)}><S.ChipText $isActive={entry.id===selected?.id}>{entry.code}</S.ChipText></S.Chip>)}</S.Selector>
    <S.LabelCard><S.BrandRow><S.Brand>Obra<S.BrandAccent>Sync</S.BrandAccent></S.Brand><S.Status><S.StatusText>{generated?'QR GERADO':'AGUARDANDO'}</S.StatusText></S.Status></S.BrandRow>
      <S.QrShell>{generated?<QRCode value={generated.qr.payload} size={188} color={theme.colors.primaryDark} backgroundColor="white" getRef={(ref)=>{qrRef.current=ref}}/>:<S.QrPlaceholder><Ionicons name="qr-code-outline" size={62} color={theme.colors.primary}/><S.PlaceholderText>{selected?'Gerar QR Code':'Nenhum material no estoque'}</S.PlaceholderText></S.QrPlaceholder>}</S.QrShell>
      <S.MaterialName>{selected?.name || 'Estoque vazio'}</S.MaterialName><S.MaterialCode>{selected?.code || '-'}</S.MaterialCode><S.Divider/>
      <Info label="Etiqueta" value={generated?.label?.id || 'Será criada localmente'}/><Info label="Obra" value={selectedProject.name}/><Info label="Unidade" value={selected?.unit || '-'}/><Info label="Local" value={selected?.location || '-'}/><Info label="Saldo" value={selected?`${selected.quantity} ${selected.unit}`:'-'}/>
    </S.LabelCard>
    <S.Hint><Ionicons name="server-outline" size={21} color={theme.colors.accent}/><S.HintText>O QR contém os dados demonstrativos da etiqueta. O PDF é gerado localmente pelo Expo Print.</S.HintText></S.Hint>
    <S.GenerateButton disabled={busy||!selected} onPress={generate}><Ionicons name="qr-code-outline" size={21} color="white"/><S.GenerateText>{busy?'Processando...':'Gerar QR Code'}</S.GenerateText></S.GenerateButton>
    <S.ButtonRow><S.Button disabled={busy||!ready} onPress={print}><Ionicons name="print" size={20} color={theme.colors.primaryDark}/><S.ButtonText>Imprimir</S.ButtonText></S.Button><S.Button $secondary disabled={busy||!ready} onPress={share}><Ionicons name="share-outline" size={20} color={theme.colors.primary}/><S.ButtonText $secondary>Compartilhar PDF</S.ButtonText></S.Button></S.ButtonRow>
  </Content></Scroll></Screen>;
}
function Info({label,value}){return <S.InfoRow><S.InfoLabel>{label}</S.InfoLabel><S.InfoValue>{value}</S.InfoValue></S.InfoRow>}
