import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';
import { generateBudgetDocumentPdf } from '../services/budgetPdfService';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';

export function BudgetScreen() {
  const { budgetDocuments, currentUser, dashboard, openScreen, removeBudgetDocument, selectedProject } = useApp();
  const [generatingId, setGeneratingId] = useState(null);
  const canWrite = [USER_ROLES.MASTER, USER_ROLES.ENGINEERING].includes(currentUser?.role);

  async function generate(document) {
    if (generatingId) return;
    setGeneratingId(document.id);
    try { await generateBudgetDocumentPdf(document, selectedProject); }
    catch (error) { Alert.alert('Não foi possível gerar o PDF', error.message); }
    finally { setGeneratingId(null); }
  }

  function confirmDelete(document) {
    Alert.alert('Excluir orçamento', `Deseja excluir ${document.number}?`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress:()=>removeBudgetDocument(document.id).catch((error)=>Alert.alert('Erro',error.message)) },
    ]);
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orçamento</Text>
          <Text style={styles.headerSub}>{selectedProject?.name}</Text>
        </View>
        <Content>
          <View style={styles.summary}>
            <Text style={styles.eyebrow}>ORÇAMENTO PREVISTO</Text>
            <Text style={styles.big}>{formatCurrency(Number(dashboard?.budget || selectedProject?.budget || 0))}</Text>
            <Text style={styles.summarySub}>Realizado: {formatCurrency(Number(dashboard?.realized || 0))}</Text>
          </View>

          {canWrite && (
            <TouchableOpacity accessibilityRole="button" style={styles.createButton} onPress={()=>openScreen(SCREENS.CREATE_BUDGET)}>
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.createText}>Criar novo orçamento</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>{currentUser?.role === USER_ROLES.CLIENT ? 'Meus orçamentos' : 'Orçamentos cadastrados'}</Text>
          {!budgetDocuments.length && <View style={styles.empty}><Ionicons name="calculator-outline" size={32} color={theme.colors.primary} /><Text style={styles.emptyTitle}>Nenhum orçamento ainda</Text><Text style={styles.emptyText}>{currentUser?.role === USER_ROLES.CLIENT ? 'Quando a equipe criar um orçamento vinculado ao seu usuário, ele aparecerá aqui.' : 'Crie um orçamento e vincule-o a um Cliente cadastrado.'}</Text></View>}

          {budgetDocuments.map((document)=>(
            <View key={document.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{flex:1}}><Text style={styles.number}>{document.number}</Text><Text style={styles.title}>{document.title}</Text></View>
                {canWrite && <TouchableOpacity accessibilityLabel={`Excluir ${document.number}`} onPress={()=>confirmDelete(document)} style={styles.iconButton}><Ionicons name="trash-outline" size={19} color={theme.colors.danger}/></TouchableOpacity>}
              </View>
              <Text style={styles.meta}>Cliente: {document.clientName}</Text>
              <Text style={styles.meta}>{document.items?.length || 0} item(ns) • validade {document.validUntil || 'não informada'}</Text>
              <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{formatCurrency(document.total)}</Text></View>
              <TouchableOpacity accessibilityRole="button" style={styles.pdfButton} disabled={generatingId===document.id} onPress={()=>generate(document)}>
                <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} /><Text style={styles.pdfText}>{generatingId===document.id?'Gerando PDF...':'Gerar / compartilhar PDF'}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{height:100}} />
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles=StyleSheet.create({
  header:{backgroundColor:theme.colors.primary,paddingHorizontal:20,paddingBottom:24,paddingTop:30},headerTitle:{color:'#FFF',fontSize:25,fontWeight:'900'},headerSub:{color:'rgba(255,255,255,.72)',fontSize:12,marginTop:4},summary:{backgroundColor:theme.colors.primary,borderRadius:22,marginTop:20,padding:18},eyebrow:{color:'#A8C6E9',fontSize:10,fontWeight:'900'},big:{color:'#FFF',fontSize:28,fontWeight:'900',marginTop:8},summarySub:{color:'rgba(255,255,255,.75)',fontSize:12,marginTop:6},createButton:{alignItems:'center',backgroundColor:theme.colors.accent,borderRadius:15,flexDirection:'row',justifyContent:'center',marginTop:16,minHeight:54},createText:{color:'#FFF',fontSize:14,fontWeight:'900',marginLeft:8},sectionTitle:{color:theme.colors.text,fontSize:19,fontWeight:'900',marginBottom:12,marginTop:24},empty:{alignItems:'center',backgroundColor:'#FFF',borderColor:theme.colors.border,borderRadius:18,borderWidth:1,padding:25},emptyTitle:{color:theme.colors.text,fontSize:15,fontWeight:'900',marginTop:8},emptyText:{color:theme.colors.textMuted,fontSize:12,lineHeight:18,marginTop:4,textAlign:'center'},card:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderRadius:18,borderWidth:1,marginBottom:12,padding:16},cardTop:{alignItems:'flex-start',flexDirection:'row'},number:{color:theme.colors.primary,fontSize:10,fontWeight:'900'},title:{color:theme.colors.text,fontSize:16,fontWeight:'900',marginTop:3},iconButton:{padding:6},meta:{color:theme.colors.textMuted,fontSize:11,marginTop:6},totalRow:{alignItems:'center',borderTopColor:theme.colors.border,borderTopWidth:1,flexDirection:'row',justifyContent:'space-between',marginTop:12,paddingTop:12},totalLabel:{color:theme.colors.textMuted,fontSize:11,fontWeight:'800'},total:{color:theme.colors.primaryDark,fontSize:18,fontWeight:'900'},pdfButton:{alignItems:'center',backgroundColor:theme.colors.primarySoft,borderRadius:12,flexDirection:'row',justifyContent:'center',marginTop:12,minHeight:42},pdfText:{color:theme.colors.primary,fontSize:12,fontWeight:'900',marginLeft:6},
});
