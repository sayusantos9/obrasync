import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { ThemeProvider, useTheme } from 'styled-components/native';
import { FormField } from '../components/forms/FormField';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { filterProjects, parseProjectBudget } from '../utils/projects';

const NAVY = '#010028';
const DEFAULTS = { name: '', client: '', location: '', budget: '' };
const STATUS = { PLANNED: 'Planejada', ACTIVE: 'Em andamento', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluída', COMPLETE: 'Concluída', CANCELLED: 'Cancelada', CANCELED: 'Cancelada', ARCHIVED: 'Arquivada', PAUSED: 'Pausada', ON_HOLD: 'Pausada' };
const LOGO = require('../assets/brand/planengen-light.png');
export function ProjectsScreen() {
  const { createProject, currentUser, members, projects, selectedProject, selectProject, refreshCurrentProject, isRefreshing, accessibilitySettings } = useApp();
  const baseTheme = useTheme();
  const insets = useSafeAreaInsets();
  const contrast = accessibilitySettings?.highContrast;
  const colors = { text: contrast ? '#000000' : '#202020', muted: contrast ? '#343434' : '#575D6B', border: contrast ? '#707070' : '#D9DFE8', blue: contrast ? '#003F85' : '#0066BE' };
  const text = (style, color = colors.text) => [style, { color, fontSize: style.fontSize * (baseTheme.fontScale || 1) }];
  const formTheme = { ...baseTheme, colors: { ...baseTheme.colors, text: colors.text, textMuted: colors.muted, border: colors.border, primary: NAVY } };
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clientUserId, setClientUserId] = useState(null);
  const [refreshError, setRefreshError] = useState('');
  const saving = useRef(false);
  const form = useForm({ defaultValues: DEFAULTS });
  const busy = form.formState.isSubmitting;
  const visibleProjects = filterProjects(projects, searchQuery);
  const canCreate = currentUser?.role === USER_ROLES.MASTER;
  const clients = useMemo(() => members.filter(member => member.role === USER_ROLES.CLIENT && member.active !== false), [members]);
  function closeForm() { if (saving.current) return; setShowForm(false); setClientUserId(null); form.reset(DEFAULTS); }
  async function refresh() {
    setRefreshError('');
    try { await refreshCurrentProject(); } catch (error) { setRefreshError(error.message || 'Não foi possível atualizar as obras.'); }
  }
  async function saveProject(values) {
    if (saving.current) return;
    saving.current = true;
    try {
      await createProject({ ...values, clientUserId, budget: parseProjectBudget(values.budget) });
      form.reset(DEFAULTS); setClientUserId(null); setShowForm(false); setSearchQuery('');
      Alert.alert('Obra cadastrada', 'A obra foi salva e selecionada. Toque nela para acessar o início.');
    } catch (error) { Alert.alert('Não foi possível cadastrar', error.message); }
    finally { saving.current = false; }
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    <View style={styles.brand}><Image source={LOGO} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo}/><Text style={text(styles.eyebrow, '#B8C9E4')}>OBRASYNC</Text></View>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={text(styles.title, '#FFFFFF')}>{currentUser?.role === USER_ROLES.CLIENT ? 'Minhas obras' : 'Obras'}</Text>
      <Text style={text(styles.subtitle, '#DCE4F0')}>{currentUser?.role === USER_ROLES.CLIENT ? 'Acompanhe as obras vinculadas ao seu acesso.' : 'Escolha a obra para continuar sua operação.'}</Text>
    </View>
    <View style={styles.body}>
      <View style={[styles.search, { borderColor: colors.border }]}><Ionicons name="search-outline" size={21} color={colors.muted}/><TextInput accessibilityLabel="Buscar obras" value={searchQuery} onChangeText={setSearchQuery} placeholder="Nome, cliente ou local" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text, fontSize: 14 * (baseTheme.fontScale || 1) }]}/>{!!searchQuery && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setSearchQuery('')} style={styles.iconButton}><Ionicons name="close" size={22} color={colors.muted}/></TouchableOpacity>}</View>
      <View style={styles.listHeading}><Text style={text(styles.count, colors.muted)}>{visibleProjects.length} {visibleProjects.length === 1 ? 'obra' : 'obras'}</Text>{canCreate && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cadastrar nova obra" onPress={() => setShowForm(true)} style={styles.newButton}><Ionicons name="add" size={19} color="#FFFFFF"/><Text style={text(styles.newText, '#FFFFFF')}>Nova obra</Text></TouchableOpacity>}</View>
      {!!refreshError && <Text accessibilityRole="alert" style={text(styles.error, '#B42318')}>{refreshError}</Text>}
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={Boolean(isRefreshing)} onRefresh={refresh} tintColor={colors.blue}/>}>
        {visibleProjects.map(project => {
          const selected = selectedProject?.id === project.id;
          const progressValue = Number(project.progress);
          const progress = Number.isFinite(progressValue) ? Math.max(0, Math.min(100, progressValue)) : 0;
          return <TouchableOpacity key={project.id} accessibilityRole="button" accessibilityLabel={`${project.name}. ${selected ? 'Obra selecionada. ' : ''}Abrir obra`} accessibilityState={{ selected }} onPress={() => selectProject(project)}
            style={[styles.card, { borderColor: selected ? colors.blue : colors.border }]}>
            <View style={styles.cardTop}><View style={styles.projectIcon}><Ionicons name="business-outline" size={24} color={colors.blue}/></View><View style={styles.cardInfo}><Text style={text(styles.projectName, NAVY)}>{project.name}</Text><Text style={text(styles.meta, colors.muted)}>{project.client || 'Cliente não informado'}</Text></View><Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={22} color={colors.blue}/></View>
            <View style={styles.location}><Ionicons name="location-outline" size={16} color={colors.muted}/><Text style={[text(styles.meta, colors.muted), { flex: 1 }]}>{project.location || 'Local não informado'}</Text></View>
            {selected && <Text style={text(styles.selected, colors.blue)}>OBRA SELECIONADA</Text>}
            <View style={styles.progressLabels}><Text style={[text(styles.meta, colors.muted), { flex: 1 }]}>{STATUS[project.status] || project.status || 'Status não informado'}</Text><Text style={text(styles.meta, colors.muted)}>{progress}% concluída</Text></View>
            <View accessibilityRole="progressbar" accessibilityLabel="Progresso da obra" accessibilityValue={{ min: 0, max: 100, now: progress }} style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]}/></View>
            <Text style={text(styles.openLink, colors.blue)}>Acessar obra <Ionicons name="arrow-forward" size={15}/></Text>
          </TouchableOpacity>;
        })}
        {!visibleProjects.length && <View style={styles.empty}><Ionicons name={searchQuery.trim() ? 'search-outline' : 'business-outline'} size={36} color={colors.blue}/><Text style={text(styles.emptyTitle, NAVY)}>{searchQuery.trim() ? 'Nenhuma obra encontrada' : 'Nenhuma obra disponível'}</Text><Text style={text(styles.emptyText, colors.muted)}>{searchQuery.trim() ? 'Tente outro nome, cliente ou local.' : canCreate ? 'Cadastre a primeira obra para começar.' : 'As obras vinculadas ao seu acesso aparecerão aqui.'}</Text></View>}
      </ScrollView>
    </View>
    <Modal visible={showForm && canCreate} animationType={accessibilitySettings?.reduceMotion ? 'none' : 'slide'} onRequestClose={closeForm}>
      <ThemeProvider theme={formTheme}><SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancelar cadastro de obra" disabled={busy} onPress={closeForm} style={styles.iconButton}><Ionicons name="arrow-back" size={24} color={NAVY}/></TouchableOpacity><Text accessibilityRole="header" style={text(styles.modalTitle, NAVY)}>Nova obra</Text></View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
          <Text style={text(styles.subtitle, colors.muted)}>Defina os dados da obra e, se desejar, vincule um usuário cliente.</Text>
          <FormField control={form.control} name="name" label="Nome da obra *" placeholder="Residencial Aurora" editable={!busy} rules={{ required: 'Informe o nome.', validate: value => Boolean(value.trim()) || 'Informe o nome.' }}/>
          <FormField control={form.control} name="client" label="Cliente / razão social" placeholder="Nome do cliente" editable={!busy && !clientUserId}/>
          <Text style={text(styles.clientTitle, NAVY)}>Usuário cliente · opcional</Text>
          <Text style={text(styles.meta, colors.muted)}>O vínculo libera a consulta conforme as permissões do cliente. Ao selecionar, o nome dele será usado no cadastro.</Text>
          {!clients.length && <Text style={text(styles.emptyText, colors.muted)}>Nenhum usuário cliente ativo disponível.</Text>}
          {clients.map(client => <TouchableOpacity key={client.id} accessibilityRole="checkbox" accessibilityLabel={`${client.name}. ${client.email}`} accessibilityState={{ checked: clientUserId === client.id, disabled: busy }} disabled={busy} onPress={() => setClientUserId(clientUserId === client.id ? null : client.id)} style={[styles.clientCard, { borderColor: clientUserId === client.id ? colors.blue : colors.border }]}><Ionicons name={clientUserId === client.id ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={colors.blue}/><View style={{ flex: 1 }}><Text style={text(styles.meta)}>{client.name}</Text><Text style={text(styles.meta, colors.muted)}>{client.email}</Text></View></TouchableOpacity>)}
          <FormField control={form.control} name="location" label="Local" placeholder="Cidade, bairro ou endereço" editable={!busy}/>
          <FormField control={form.control} name="budget" label="Orçamento previsto (R$)" placeholder="Ex.: 120.000,50" keyboardType="decimal-pad" editable={!busy} rules={{ validate: value => Number.isFinite(parseProjectBudget(value)) || 'Informe um valor válido, como 1.200,50, sem sinal negativo.' }}/>
          <Text style={text(styles.meta, colors.muted)}>Opcional. Deixe vazio para cadastrar com valor zero.</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Salvar obra" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={form.handleSubmit(saveProject)} style={[styles.save, busy && { opacity: 0.6 }]}>{busy ? <ActivityIndicator color="#FFFFFF"/> : <Ionicons name="checkmark" size={22} color="#FFFFFF"/>}<Text style={text(styles.newText, '#FFFFFF')}>{busy ? 'Salvando...' : 'Salvar obra'}</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={closeForm} style={styles.cancel}><Text style={text(styles.newText, colors.muted)}>Cancelar</Text></TouchableOpacity>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView></ThemeProvider>
    </Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY }, brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 12, gap: 16 },
  logo: { width: 126, height: 36, flexShrink: 1 }, eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700' },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }, title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { fontSize: 14, marginTop: 8 }, body: { flex: 1, backgroundColor: '#EEF0F2', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, minHeight: 54 },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 14 }, iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginVertical: 16 }, count: { fontSize: 13, flexShrink: 1 },
  newButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: NAVY, borderRadius: 12 }, newText: { fontSize: 14, fontWeight: '600' },
  card: { padding: 18, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, marginBottom: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, projectIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#E7F2FE', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 }, projectName: { fontSize: 17, fontWeight: '700' }, meta: { fontSize: 12, marginTop: 4 }, location: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  selected: { fontSize: 10, letterSpacing: 1, fontWeight: '700', marginTop: 16 }, progressLabels: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  track: { height: 5, backgroundColor: '#E5EAF1', borderRadius: 5, marginTop: 9, overflow: 'hidden' }, fill: { height: 5, backgroundColor: '#0084F4' },
  openLink: { fontSize: 13, fontWeight: '600', marginTop: 18 }, empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' }, emptyText: { fontSize: 13, marginTop: 8 },
  error: { fontSize: 13, marginBottom: 12 }, modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#DFE3EA' }, modalTitle: { fontSize: 22, fontWeight: '700', flex: 1 },
  form: { padding: 22, paddingBottom: 36 }, clientTitle: { fontSize: 16, fontWeight: '600', marginTop: 24 },
  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 10, borderWidth: 1, borderRadius: 12 },
  save: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 54, padding: 16, backgroundColor: NAVY, borderRadius: 14, marginTop: 26 },
  cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
