import { Text as NativeText, TextProps, StyleSheet } from 'react-native';
export function Text(props: TextProps) {
  const weight = String(StyleSheet.flatten(props.style)?.fontWeight || '400');
  const family = ['600', '700', '800', '900', 'bold'].includes(weight) ? 'DM_Semibold' : weight === '500' ? 'DM_Medium' : 'DM_Regular';
  return <NativeText maxFontSizeMultiplier={1.4} {...props} style={[props.style, { fontFamily: family, fontWeight: 'normal' }]} />;
}
