import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { BudgetItemsPanel } from '../components/budget/BudgetItemsPanel';
import { BudgetSummaryPanel } from '../components/budget/BudgetSummaryPanel';
import { BUDGET_VIEWS, BudgetViewTabs } from '../components/budget/BudgetViewTabs';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { getProjectBudget } from '../data/budgetData';
import { SCREENS } from '../navigation/routes';
import { generateBudgetPdf } from '../services/budgetPdfService';
import { theme } from '../theme';
import { calculateBudgetMetrics } from '../utils/budget';
import { formatCurrency } from '../utils/currency';
import { budgetStyles as styles } from './BudgetScreen.styles';

export function BudgetScreen() {
  const {
    budgetDocuments,
    budgetItems,
    extraExpenses,
    openScreen,
    removeBudgetDocument,
    removeBudgetItem,
    selectedProject,
  } = useApp();
  const [activeView, setActiveView] = useState(BUDGET_VIEWS.SUMMARY);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const budget = getProjectBudget(selectedProject.id);
  const metrics = calculateBudgetMetrics({
    budget,
    budgetItems,
    expenses: extraExpenses,
    projectId: selectedProject.id,
  });
  const projectBudgetDocuments = budgetDocuments.filter(
    (document) => document.projectId === selectedProject.id,
  );

  function handleImportBudget() {
    Alert.alert(
      'Importar orçamento',
      'A importação por XLSX/CSV fica preparada para uma integração de backend. Para criar manualmente, use “Novo orçamento”.',
    );
  }

  async function handleGeneratePdf() {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const result = await generateBudgetPdf({
        project: selectedProject,
        budget,
        budgetItems: metrics.projectItems,
        ...metrics,
      });

      if (!result.wasShared) {
        Alert.alert('PDF gerado', `Arquivo criado em: ${result.uri}`);
      }
    } catch {
      Alert.alert(
        'Não foi possível gerar o PDF',
        'Tente novamente. Se o problema continuar, reinicie o Expo Go.',
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleRemoveBudgetItem(itemId) {
    Alert.alert(
      'Remover item',
      'Deseja remover este item do orçamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeBudgetItem(itemId) },
      ],
    );
  }

  function handleRemoveDocument(document) {
    Alert.alert('Excluir orçamento', `Deseja excluir ${document.number}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeBudgetDocument(document.id) },
    ]);
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Orçamento</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>{budget.version}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{selectedProject.name}</Text>
        </View>

        <Content>
          <TouchableOpacity style={styles.newBudgetButton} onPress={() => openScreen(SCREENS.CREATE_BUDGET)}>
            <Ionicons name="add-circle" size={22} color="#FFFFFF" />
            <Text style={styles.newBudgetText}>Criar novo orçamento</Text>
          </TouchableOpacity>

          {!!projectBudgetDocuments.length && (
            <View style={styles.createdSection}>
              <Text style={styles.createdSectionTitle}>Orçamentos criados</Text>
              {projectBudgetDocuments.map((document) => (
                <View key={document.id} style={styles.documentCard}>
                  <View style={styles.documentTop}>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentNumber}>{document.number}</Text>
                      <Text style={styles.documentTitle}>{document.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveDocument(document)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.documentMeta}>Cliente: {document.clientName}</Text>
                  <Text style={styles.documentMeta}>{document.items.length} item(ns) • válido até {document.validUntil}</Text>
                  <Text style={styles.documentTotal}>{formatCurrency(document.total)}</Text>
                </View>
              ))}
            </View>
          )}

          <BudgetViewTabs activeView={activeView} onChange={setActiveView} />

          {activeView === BUDGET_VIEWS.SUMMARY ? (
            <BudgetSummaryPanel
              budget={budget}
              metrics={metrics}
              isGeneratingPdf={isGeneratingPdf}
              onGeneratePdf={handleGeneratePdf}
              onImportBudget={handleImportBudget}
            />
          ) : (
            <BudgetItemsPanel
              items={metrics.projectItems}
              itemsTotal={metrics.addedItemsTotal}
              onAddItem={() => openScreen(SCREENS.ADD_BUDGET_ITEM)}
              onRemoveItem={handleRemoveBudgetItem}
            />
          )}
        </Content>
      </Scroll>
    </Screen>
  );
}
