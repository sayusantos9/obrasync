import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';

const Header = styled.View`height: 92px; padding: 42px 18px 12px; background-color: ${({ theme }) => theme.colors.primaryDark}; flex-direction: row; align-items: center;`;
const Back = styled.TouchableOpacity`width: 42px; height: 42px; align-items: center; justify-content: center; margin-right: 4px;`;
const Title = styled.Text`color: white; font-size: 20px; font-weight: 900; flex: 1;`;

export function ScreenHeader({ title, right }) {
  const { goBack } = useApp();
  return <Header><Back onPress={goBack}><Ionicons name="arrow-back" size={24} color="white" /></Back><Title>{title}</Title>{right}</Header>;
}
