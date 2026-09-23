import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { getProjectBudget } from '../data/budgetData';
import { generateBudgetPdf } from '../services/budgetPdfService';
import { theme } from '../theme';
import { formatCompactCurrency } from '../utils/currency';
import { budgetStyles as styles } from './BudgetScreen.styles';

export function BudgetScreen() {
  const { selectedProject, extraExpenses } = useApp();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const budget = getProjectBudget(selectedProject.id);
  const extraExpensesTotal = useMemo(
    () => extraExpenses
      .filter((expense) => expense.projectId === selectedProject.id)
      .reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [extraExpenses, selectedProject.id],
  );
  const realizedTotal = budget.realized + extraExpensesTotal;
  const balance = budget.total - realizedTotal;
  const usagePercentage = (realizedTotal / budget.total) * 100;
  const progressPercentage = Math.min(100, Math.max(0, usagePercentage));
  const isOverBudget = balance < 0;

  function handleImportBudget() {
    Alert.alert(
      'Importar orçamento',
      'No protótipo, a importação será feita por XLSX/CSV com validação de colunas e relatório de erros.',
    );
  }

  async function handleGeneratePdf() {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const result = await generateBudgetPdf({
        project: selectedProject,
        budget,
        realizedTotal,
        balance,
        isOverBudget,
        extraExpensesTotal,
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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>ORÇAMENTO PREVISTO</Text>
            <Text style={styles.budgetValue}>{formatCompactCurrency(budget.total)}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isOverBudget ? theme.colors.danger : theme.colors.accent,
                  },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.smallText}>
                {usagePercentage.toFixed(1).replace('.', ',')}% realizado
              </Text>
              <Text style={styles.smallText}>
                {isOverBudget
                  ? 'Acima do orçamento'
                  : `${formatCompactCurrency(balance)} disponível`}
              </Text>
            </View>
          </View>

          <View style={styles.cards}>
            <View style={styles.miniCard}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.successSoft }]}>
                <Ionicons name="checkmark-circle-outline" size={21} color={theme.colors.success} />
              </View>
              <Text style={styles.miniLabel}>Realizado</Text>
              <Text style={styles.miniValue}>{formatCompactCurrency(realizedTotal)}</Text>
            </View>

            <View style={styles.miniCard}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isOverBudget ? theme.colors.dangerSoft : theme.colors.primarySoft },
                ]}
              >
                <Ionicons
                  name={isOverBudget ? 'warning-outline' : 'wallet-outline'}
                  size={21}
                  color={isOverBudget ? theme.colors.danger : theme.colors.primary}
                />
              </View>
              <Text style={styles.miniLabel}>{isOverBudget ? 'Excedido' : 'Saldo'}</Text>
              <Text
                style={[
                  styles.miniValue,
                  isOverBudget && { color: theme.colors.danger },
                ]}
              >
                {formatCompactCurrency(balance)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={handleImportBudget}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionText, styles.secondaryActionText]}>Importar XLSX/CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isGeneratingPdf}
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleGeneratePdf}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator color={theme.colors.primaryDark} />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primaryDark} />
                  <Text style={[styles.actionText, styles.primaryActionText]}>Gerar PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Serviços e composições</Text>
            <Text style={styles.sectionMeta}>{budget.services.length} grupos</Text>
          </View>

          {budget.services.map((service) => {
            const executionPercentage = service.planned
              ? (service.realized / service.planned) * 100
              : 0;
            const serviceBalance = service.planned - service.realized;

            return (
              <View key={service.code} style={styles.serviceCard}>
                <View style={styles.serviceTop}>
                  <View style={[styles.serviceIcon, { backgroundColor: service.backgroundColor }]}>
                    <Ionicons name={service.icon} size={22} color={service.color} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCode}>
                      Serviço {service.code} • {service.compositions} composições
                    </Text>
                  </View>
                  <Text style={styles.serviceValue}>{formatCompactCurrency(service.planned)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>REALIZADO</Text>
                    <Text style={styles.detailValue}>{formatCompactCurrency(service.realized)}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>SALDO</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: serviceBalance < 0 ? theme.colors.danger : theme.colors.success },
                      ]}
                    >
                      {formatCompactCurrency(serviceBalance)}
                    </Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>EXECUÇÃO</Text>
                    <Text style={styles.detailValue}>
                      {executionPercentage.toFixed(1).replace('.', ',')}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.noteText}>
              O orçamento acompanha a obra ativa. Ao trocar de obra, os valores, serviços e o PDF usam o novo contexto automaticamente.
            </Text>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}
