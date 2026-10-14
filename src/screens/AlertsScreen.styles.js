import styled from 'styled-components/native';

export const Header = styled.View`
  padding: 52px 20px 24px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

export const MarkButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const FilterRow = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 20px -20px 6px;
  padding-left: 20px;
`;

export const FilterChip = styled.TouchableOpacity`
  height: 38px;
  margin-right: 8px;
  padding: 0 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, theme }) => (
    $isActive ? theme.colors.primary : 'white'
  )};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
`;

export const FilterText = styled.Text`
  color: ${({ $isActive, theme }) => (
    $isActive ? 'white' : theme.colors.textMuted
  )};
  font-size: 13px;
  font-weight: 800;
`;

export const AlertCard = styled.TouchableOpacity`
  margin-top: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

export const AlertIcon = styled.View`
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 15px;
`;

export const AlertInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

export const AlertTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 900;
`;

export const Description = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 17px;
`;

export const Time = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
`;
