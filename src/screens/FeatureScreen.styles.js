import styled from 'styled-components/native';

export const Summary = styled.View`
  margin-top: 20px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.primaryDark};
  border-radius: 22px;
`;

export const Eyebrow = styled.Text`
  color: #A9C2F6;
  font-size: 12px;
  font-weight: 800;
`;

export const Big = styled.Text`
  margin-top: 8px;
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

export const Muted = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 19px;
`;

export const Section = styled.Text`
  margin: 24px 0 4px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 19px;
  font-weight: 900;
`;

export const Card = styled.TouchableOpacity`
  margin-top: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Icon = styled.View`
  width: 44px;
  height: 44px;
  margin-right: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor || '#EDE6F1'};
  border-radius: 14px;
`;

export const Flex = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 900;
`;

export const Value = styled.Text`
  color: ${({ $color, theme }) => $color || theme.colors.text};
  font-size: 16px;
  font-weight: 900;
`;

export const Pill = styled.View`
  padding: 6px 9px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 20px;
`;

export const PillText = styled.Text`
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 900;
`;

export const PrimaryButton = styled.TouchableOpacity`
  height: 54px;
  margin-top: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
`;

export const PrimaryButtonText = styled.Text`
  color: white;
  font-size: 15px;
  font-weight: 900;
`;

export const ActionRow = styled.View`
  margin-top: 18px;
  flex-direction: row;
  justify-content: space-between;
`;

export const ActionButton = styled.TouchableOpacity`
  width: 48.5%;
  min-height: 78px;
  padding: 12px;
  justify-content: space-between;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 17px;
`;

export const ActionText = styled.Text`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 900;
`;
