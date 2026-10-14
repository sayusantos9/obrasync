import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { SearchBar } from '../components/common/SearchBar';
import { FormField } from '../components/forms/FormField';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Content, Screen, Scroll, SectionTitle } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { theme } from '../theme';

export function ProjectsScreen() {
  const { createProject, currentUser, members, projects, selectedProject, selectProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clientUserId, setClientUserId] = useState(null);
  const form = useForm({ defaultValues: { name: '', client: '', location: '', budget: '' } });
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => !normalizedSearch || [project.name, project.client, project.location].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)));
  const canCreate = currentUser?.role === USER_ROLES.MASTER;
  const clients = useMemo(() => members.filter((member) => member.role === USER_ROLES.CLIENT && member.active !== false), [members]);

  async function saveProject(values) {
    try {
      await createProject({ ...values, clientUserId, budget: Number(values.budget || 0) });
      form.reset();
      setClientUserId(null);
      setShowForm(false);
      Alert.alert('Obra cadastrada', 'A obra foi salva no Supabase.');
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', error.message);
    }
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <Text style={styles.title}>{currentUser?.role === USER_ROLES.CLIENT ? 'Minha obra' : 'Obras'}</Text>
          <Text style={styles.subtitle}>{currentUser?.role === USER_ROLES.CLIENT ? 'Aqui aparecem somente as obras vinculadas ao seu usuário.' : 'Selecione a obra ativa ou cadastre uma nova.'}</Text>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Nome, cliente ou endereço" />
        </View>
        <Content>
          <SectionTitle style={styles.sectionTitle}>{visibleProjects.length} obra(s)</SectionTitle>
          {visibleProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} isActive={selectedProject?.id === project.id} onPress={() => selectProject(project)} />)}
          {!visibleProjects.length && <Text style={styles.empty}>Nenhuma obra vinculada a este acesso.</Text>}

          {canCreate && !showForm && (
            <TouchableOpacity accessibilityRole="button" style={styles.newButton} onPress={() => setShowForm(true)}>
              <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.newText}>Cadastrar nova obra</Text>
            </TouchableOpacity>
          )}

          {canCreate && showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nova obra</Text>
              <FormField control={form.control} name="name" label="NOME DA OBRA" placeholder="Residencial Aurora" rules={{ required: 'Informe o nome.' }} />
              <FormField control={form.control} name="client" label="CLIENTE / RAZÃO SOCIAL" placeholder="Nome do cliente" />

              {!!clients.length && <Text style={styles.clientLabel}>VINCULAR A UM USUÁRIO CLIENTE (OPCIONAL)</Text>}
              {clients.map((client) => {
                const selected = clientUserId === client.id;
                return (
                  <TouchableOpacity key={client.id} onPress={() => setClientUserId(selected ? null : client.id)} style={[styles.clientCard, selected && styles.clientCardSelected]}>
                    <View style={[styles.radio, selected && styles.radioSelected]} />
                    <View><Text style={styles.clientName}>{client.name}</Text><Text style={styles.clientEmail}>{client.email}</Text></View>
                  </TouchableOpacity>
                );
              })}

              <FormField control={form.control} name="location" label="LOCAL" placeholder="São Luís - MA" />
              <FormField control={form.control} name="budget" label="ORÇAMENTO PREVISTO" keyboardType="numeric" placeholder="1200000" />
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancel} onPress={() => { setShowForm(false); setClientUserId(null); form.reset(); }}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.save} onPress={form.handleSubmit(saveProject)}><Text style={styles.saveText}>Salvar obra</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 28 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,.75)', fontSize: 12, marginBottom: 16, marginTop: 4 },
  sectionTitle: { marginTop: 4 },
  empty: { color: theme.colors.textMuted, fontSize: 13, paddingVertical: 24, textAlign: 'center' },
  newButton: { alignItems: 'center', borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 100, marginTop: 10, minHeight: 54 },
  newText: { color: theme.colors.primary, fontSize: 14, fontWeight: '900', marginLeft: 7 },
  formCard: { backgroundColor: '#FFF', borderColor: theme.colors.border, borderRadius: 20, borderWidth: 1, marginBottom: 110, marginTop: 14, padding: 16 },
  formTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '900' },
  clientLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900', marginTop: 18 },
  clientCard: { alignItems: 'center', borderColor: theme.colors.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', marginTop: 8, padding: 11 },
  clientCardSelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  radio: { borderColor: theme.colors.border, borderRadius: 8, borderWidth: 2, height: 16, marginRight: 10, width: 16 },
  radioSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  clientName: { color: theme.colors.text, fontSize: 12, fontWeight: '900' },
  clientEmail: { color: theme.colors.textMuted, fontSize: 10, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancel: { alignItems: 'center', borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 },
  cancelText: { color: theme.colors.textMuted, fontWeight: '800' },
  save: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 14, flex: 1, justifyContent: 'center', minHeight: 48 },
  saveText: { color: '#FFF', fontWeight: '900' },
});
