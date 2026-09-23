import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';

const Header = styled.View`
  height: 92px;
  padding: 42px 18px 12px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primaryDark};
`;

const BackButton = styled.TouchableOpacity`
  width: 42px;
  height: 42px;
  margin-right: 4px;
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  flex: 1;
  color: white;
  font-size: 20px;
  font-weight: 900;
`;

export function ScreenHeader({ title, right }) {
  const { goBack } = useApp();

  return (
    <Header>
      <BackButton onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </BackButton>
      <Title>{title}</Title>
      {right}
    </Header>
  );
}
