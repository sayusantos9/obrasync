import styled from 'styled-components/native';

export const Screen = styled.SafeAreaView`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const Scroll = styled.ScrollView.attrs({ showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: 118 } })``;
export const Content = styled.View`padding: 0 20px;`;
export const Row = styled.View`flex-direction: row; align-items: center;`;
export const SectionHeader = styled.View`flex-direction: row; align-items: center; justify-content: space-between; margin: 26px 0 14px;`;
export const SectionTitle = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 21px; font-weight: 800;`;
export const LinkText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; font-weight: 700;`;
export const Card = styled.View`background-color: ${({ theme }) => theme.colors.surface}; border-radius: ${({ theme }) => theme.radius.md}px; border: 1px solid ${({ theme }) => theme.colors.border}; padding: 16px;`;
export const EmptyText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 15px; line-height: 22px; text-align: center;`;
