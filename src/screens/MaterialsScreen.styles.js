import styled from 'styled-components/native';

export const Header = styled.View`
  padding: 52px 20px 25px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  margin-bottom: 22px;
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

export const ListHeader = styled.View`
  margin: 24px 0 2px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Count = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 17px;
  font-weight: 800;
`;

export const Caption = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

export const MaterialCard = styled.TouchableOpacity`
  margin-top: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

export const MaterialIcon = styled.View`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 15px;
`;

export const MaterialInfo = styled.View`
  flex: 1;
  margin-left: 13px;
`;

export const MaterialCode = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  font-weight: 700;
`;

export const MaterialName = styled.Text`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 800;
`;

export const MaterialMeta = styled.Text`
  margin-top: 5px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

export const Variation = styled.Text`
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 900;
`;
