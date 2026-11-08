import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity} from '../accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../accessibility/ReadableText';

import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';

const Header = styled(AccessibleView)`
  min-height: 92px;
  padding: 42px 18px 12px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;
const BackButton = styled(AccessibleTouchableOpacity)`width: 42px; height: 42px; margin-right: 4px; align-items: center; justify-content: center;`;
const Title = styled(ReadableText)`flex: 1; color: white; font-size: ${({ theme }) => 20 * theme.fontScale}px; font-weight: 900;`;

export function ScreenHeader({ title, right, onBack, backLabel = 'Voltar' }) {
  const { goBack } = useApp();
  const handleBack = onBack || goBack;

  return (
    <Header accessibilityRole="header">
      <BackButton accessibilityRole="button" accessibilityLabel={backLabel} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </BackButton>
      <Title>{title}</Title>
      {right}
    </Header>
  );
}
