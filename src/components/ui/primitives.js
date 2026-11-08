import {AccessibleView,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../accessibility/ReadableText';
import { KeyboardScrollView } from '../layout/KeyboardScrollView';
import styled from 'styled-components/native';

export const Screen = styled.SafeAreaView`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
export const Scroll = styled(KeyboardScrollView).attrs({ showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: 118 } })``;
export const Content = styled(AccessibleView)`padding: 0 20px;`;
export const Row = styled(AccessibleView)`flex-direction: row; align-items: center;`;
export const SectionHeader = styled(AccessibleView)`flex-direction: row; align-items: center; justify-content: space-between; margin: 26px 0 14px;`;
export const SectionTitle = styled(ReadableText)`color: ${({ theme }) => theme.colors.text}; font-size: 21px; font-weight: 800;`;
export const LinkText = styled(ReadableText)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; font-weight: 700;`;
export const Card = styled(AccessibleView)`background-color: ${({ theme }) => theme.colors.surface}; border-radius: ${({ theme }) => theme.radius.md}px; border: 1px solid ${({ theme }) => theme.colors.border}; padding: 16px;`;
export const EmptyText = styled(ReadableText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 15px; line-height: 22px; text-align: center;`;
