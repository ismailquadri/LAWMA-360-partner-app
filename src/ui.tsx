import { Text } from './text';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, SvgXml } from 'react-native-svg';
import { SheetOverlay } from './sheet-overlay';
import { logoXml } from './logo';

export const C = { bg: '#FAF9F6', paper: '#FFFFFF', ink: '#18392F', muted: '#66736B', line: '#E6E8E1', green: '#215C43', pale: '#EAF0E6', orange: '#C4521D', peach: '#F8EDE3', dark: '#153F30', red: '#B44734' };
export const photos = { home: require('../assets/onboarding/home.png'), delivery: require('../assets/onboarding/delivery.png'), collection: require('../assets/onboarding/collection.png') };
export const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, scroll: { flexGrow: 1, alignItems: 'center' }, page: { width: '100%', maxWidth: 520, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 112 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: C.muted, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '700', color: C.ink, letterSpacing: -1.2 },
  subtitle: { fontSize: 15, lineHeight: 23, color: C.muted, marginTop: 10 },
  heading: { fontSize: 19, lineHeight: 25, fontWeight: '600', color: C.ink, letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 22, color: C.ink }, small: { fontSize: 12, lineHeight: 18, color: C.muted },
  card: { backgroundColor: C.paper, borderColor: C.line, borderWidth: 1, borderRadius: 24, padding: 20, marginTop: 16, shadowColor: '#163B2C', shadowOpacity: 0.035, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  button: { minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 13, backgroundColor: C.green },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  secondary: { backgroundColor: C.pale }, secondaryText: { color: C.green }, outline: { backgroundColor: 'transparent', borderColor: C.line, borderWidth: 1 }, outlineText: { color: C.ink },
  field: { backgroundColor: C.paper, borderColor: '#D9DFD6', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, minHeight: 56, fontSize: 16, color: C.ink, marginTop: 8 },
  label: { fontSize: 13, color: C.ink, fontWeight: '600', marginTop: 20 },
  pill: { borderRadius: 8, backgroundColor: C.pale, paddingHorizontal: 9, paddingVertical: 5 }, pillText: { fontSize: 11, color: C.green, fontWeight: '600' },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 18 },
  hero: { backgroundColor: C.dark, borderRadius: 26, padding: 24, marginTop: 20 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 33, fontWeight: '600', letterSpacing: -0.8 },
  heroBody: { color: '#CBDED3', fontSize: 14, lineHeight: 21, marginTop: 10 },
});
export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | undefined>(undefined);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => setReduced(true)); const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced); return () => subscription.remove(); }, []);
  return reduced;
}
export function Screen({ children, noTop = false }: { children: React.ReactNode; noTop?: boolean }) { return <SafeAreaView style={S.safe} edges={['top', 'left', 'right']}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}><View style={[S.page, noTop && { paddingTop: 4 }]}>{children}</View></ScrollView></KeyboardAvoidingView></SafeAreaView>; }
export function Brand({ small = false }: { small?: boolean }) { return <View accessibilityLabel="SmartWaste360" style={{ alignItems: 'flex-start' }}><SvgXml xml={logoXml} width={small ? 184 : 258} height={small ? 23 : 32} /></View>; }
export function Header({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) { return <View style={{ marginBottom: 10 }}><Text style={S.eyebrow}>{eyebrow}</Text><Text accessibilityRole="header" style={S.title}>{title}</Text>{sub ? <Text style={S.subtitle}>{sub}</Text> : null}</View>; }
export function Card({ children, style }: { children: React.ReactNode; style?: object }) { return <View style={[S.card, style]}>{children}</View>; }
export function Button({ title, onPress, variant = 'primary', disabled = false, style }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'outline'; disabled?: boolean; style?: object }) { return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [S.button, variant === 'secondary' && S.secondary, variant === 'outline' && S.outline, disabled && { opacity: 0.4 }, pressed && !disabled && { opacity: 0.82, transform: [{ scale: 0.98 }] }, style]}><Text style={[S.buttonText, variant === 'secondary' && S.secondaryText, variant === 'outline' && S.outlineText]}>{title}</Text></Pressable>; }
export function TextButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4, opacity: pressed ? 0.5 : 1 })}><Text style={{ color: C.green, fontSize: 13, fontWeight: '600' }}>{title}</Text></Pressable>; }
export function Back({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) { return <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}><TextButton title={`‹  ${label}`} onPress={onPress} /></View>; }
export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, maxLength }: { label: string; value: string; onChangeText: (text: string) => void; placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'number-pad'; multiline?: boolean; maxLength?: number }) { const [focus, setFocus] = useState(false); return <View><Text style={S.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#879188" keyboardType={keyboardType} maxLength={maxLength} multiline={multiline} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={[S.field, focus && { borderColor: C.green, backgroundColor: '#FAFCF8' }, multiline && { minHeight: 130, textAlignVertical: 'top' }]} /></View>; }
export function Pill({ text, warm = false }: { text: string; warm?: boolean }) { return <View style={[S.pill, warm && { backgroundColor: C.peach }]}><Text style={[S.pillText, warm && { color: '#9E4219' }]}>{text}</Text></View>; }
export function Notice({ text }: { text: string }) { return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ backgroundColor: C.pale, borderRadius: 14, padding: 15, marginTop: 16 }}><Text style={{ color: C.green, fontSize: 13, lineHeight: 20 }}>{text}</Text></View>; }
export function ListRow({ title, detail, right, onPress, divider = true }: { title: string; detail?: string; right?: string; onPress?: () => void; divider?: boolean }) { const content = <View style={[S.row, { minHeight: 66, paddingVertical: 13, borderBottomColor: C.line, borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0 }]}><View style={{ flex: 1 }}><Text style={[S.body, { fontWeight: '500' }]}>{title}</Text>{detail ? <Text style={[S.small, { marginTop: 3 }]}>{detail}</Text> : null}</View>{right ? <Text style={{ color: C.green, fontWeight: '600', fontSize: 12, maxWidth: 110, textAlign: 'right' }}>{right}</Text> : null}{onPress ? <Text style={{ color: '#869186', fontSize: 22 }}>›</Text> : null}</View>; return onPress ? <Pressable accessibilityRole="button" onPress={onPress}>{content}</Pressable> : content; }
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <SheetOverlay visible={visible} onClose={onClose} reduced={reduced !== false} title={title}>
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable testID="sheet-shade" accessibilityRole="button" accessibilityLabel="Close sheet" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: '#10271C66' }]} />
      <KeyboardAvoidingView testID="sheet-panel" behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ maxHeight: '92%', width: '100%', maxWidth: 520, alignSelf: 'center' }}>
        <View accessibilityViewIsModal style={{ backgroundColor: C.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 36, flexShrink: 1, maxHeight: '100%' }}>
          <View style={{ width: 36, height: 4, borderRadius: 3, backgroundColor: '#CFD5CD', alignSelf: 'center', marginBottom: 15 }} />
          <View style={[S.row, { marginBottom: 10 }]}><Text accessibilityRole="header" style={[S.heading, { flex: 1 }]}>{title}</Text><TextButton title="Close" onPress={onClose} /></View>
          <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  </SheetOverlay>;
}
export function Confirmation({ title, detail, onClose, action = 'Done' }: { title: string; detail: string; onClose: () => void; action?: string }) {
  const [value] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  useEffect(() => { if (reduced === undefined) return; Animated.timing(value, { toValue: 1, duration: reduced ? 0 : 380, useNativeDriver: true }).start(); }, [reduced, value]);
  return <><Animated.View style={{ alignItems: 'center', paddingVertical: 16, opacity: value, transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}><View style={{width:130,height:104,alignItems:'center',justifyContent:'center'}}>{[-1,1].flatMap(side=>[0,1,2].map(i=><Animated.View key={`${side}-${i}`} style={{position:'absolute',width:5,height:9,borderRadius:2,backgroundColor:i%2?C.green:C.orange,opacity:value.interpolate({inputRange:[0,.25,1],outputRange:[0,1,0]}),transform:[{translateX:value.interpolate({inputRange:[0,1],outputRange:[0,side*(45+i*9)]})},{translateY:value.interpolate({inputRange:[0,1],outputRange:[0,-35+i*27]})},{rotate:`${side*(25+i*35)}deg`}]}}/>))}<Svg width={88} height={88} viewBox="0 0 88 88"><Circle cx="44" cy="44" r="40" fill={C.pale}/><Circle cx="44" cy="44" r="29" fill={C.green}/><Path d="M31 44l9 9 18-20" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="76" cy="17" r="6" fill={C.orange}/></Svg></View><Text accessibilityRole="header" style={[S.title, { textAlign: 'center', marginTop: 20, fontSize: 27 }]}>{title}</Text><Text style={[S.subtitle, { textAlign: 'center', marginBottom: 24 }]}>{detail}</Text></Animated.View><Button title={action} onPress={onClose} /></>;
}
export function Success({ visible, title, detail, onClose, action = 'Done' }: { visible: boolean; title: string; detail: string; onClose: () => void; action?: string }) { return <Sheet visible={visible} onClose={onClose} title="All set">{visible ? <Confirmation title={title} detail={detail} onClose={onClose} action={action} /> : null}</Sheet>; }
export function BinArt({ size = 84 }: { size?: number }) { return <Svg accessibilityLabel="Household smart bin" width={size} height={size} viewBox="0 0 100 110"><Path d="M25 28h51l-5 65H30z" fill="#254D3D"/><Path d="M31 32h14v53H35z" fill="#34634E"/><Rect x="20" y="20" width="60" height="11" rx="4" fill="#DF6B32"/><Path d="M40 20v-5h21v5" stroke="#284D3D" strokeWidth="4" fill="none"/><Rect x="48" y="44" width="17" height="20" rx="3" fill="#E6EDDC"/><Path d="M53 54h7m-5-4h5" stroke="#34634E" strokeWidth="2"/><Circle cx="34" cy="94" r="8" fill="#192E25"/><Circle cx="69" cy="94" r="8" fill="#192E25"/><Circle cx="34" cy="94" r="3" fill="#ADB9A5"/><Circle cx="69" cy="94" r="3" fill="#ADB9A5"/></Svg>; }
