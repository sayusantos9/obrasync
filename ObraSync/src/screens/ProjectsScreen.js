import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '../components/common/SearchBar';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Content, Screen, Scroll, SectionTitle } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { projects } from '../data/mockData';
import { theme } from '../theme';
import { filterProjects } from '../utils/projects';
import { projectsStyles as styles } from './ProjectsScreen.styles';

export function ProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedProject, selectProject } = useApp();

  const visibleProjects = filterProjects(projects, searchQuery);

  function handleCreateProject() {
    Alert.alert(
      'Cadastro de obra',
      'Este atalho é destinado a usuários autorizados com perfil gestor/master.',
    );
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <Text style={styles.title}>Selecionar obra</Text>
          <Text style={styles.subtitle}>Escolha onde você vai trabalhar agora.</Text>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nome, cliente ou endereço"
          />
        </View>

        <Content>
          <SectionTitle style={styles.sectionTitle}>
            {visibleProjects.length} obra(s) disponível(is)
          </SectionTitle>

          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isActive={selectedProject.id === project.id}
              onPress={() => selectProject(project)}
            />
          ))}

          {!visibleProjects.length && (
            <Text style={styles.emptyText}>Nenhuma obra encontrada.</Text>
          )}

          <TouchableOpacity style={styles.newButton} onPress={handleCreateProject}>
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={theme.colors.primary}
            />
            <Text style={styles.newButtonText}>Cadastrar nova obra</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}
