import { Text } from './text';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { C, S, TextButton, useReducedMotion } from './ui';
import { SheetOverlay } from './sheet-overlay';

// Partner-only additions on top of the shared ui.tsx primitives: wide desktop
// page, KPI tiles, status chips, data-table rows, a side drawer and badges.
// Tokens keep the AA-checked pairs from the partner design review.
export const P = { cta: '#C24C00', ctaInk: '#FFFFFF', amber: '#8f5c08', amberBg: '#FBF0D9', lime: '#DDE9AE', limeInk: '#1d3a1a', chipGreen: '#1d6b3f', chipGreenBg: '#DFF1E3', red: '#B3261E', redBg: '#FBE4E1', sidebar: C.dark, sidebarMuted: '#CBDED3' };
export const PS = StyleSheet.create({
  page: { width: '100%', maxWidth: 1120, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 72, alignSelf: 'center' },
  kpi: { flexGrow: 1, flexBasis: 170, backgroundColor: C.paper, borderColor: C.line, borderWidth: 1, borderRadius: 20, padding: 18 },
  kpiLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  kpiValue: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: C.ink, marginTop: 8, letterSpacing: -0.6 },
  kpiSub: { fontSize: 12, lineHeight: 17, color: C.muted, marginTop: 4 },
  chip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start' },
  cell: { fontSize: 13, lineHeight: 19, color: C.ink },
});
export function Page({ children }: { children: React.ReactNode }) { return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}><View style={PS.page}>{children}</View></ScrollView>; }
export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) { return <View style={PS.kpi}><Text style={PS.kpiLabel}>{label}</Text><Text style={PS.kpiValue}>{value}</Text>{sub ? <Text style={PS.kpiSub}>{sub}</Text> : null}</View>; }
const tones = { green: { bg: P.chipGreenBg, ink: P.chipGreen }, amber: { bg: P.amberBg, ink: P.amber }, red: { bg: P.redBg, ink: P.red }, neutral: { bg: C.pale, ink: C.green } } as const;
export type ChipTone = keyof typeof tones;
const toneFor = (label: string): ChipTone => ['Active', 'Accepted', 'Approved', 'Collected', 'Completed', 'Delivered', 'Resolved'].includes(label) ? 'green' : ['Requested', 'Pending', 'In review', 'Out for delivery', 'Scheduled', 'Allocated'].includes(label) ? 'amber' : ['Declined', 'Cancelled', 'Attention needed', 'Open'].includes(label) ? 'red' : 'neutral';
export function Chip({ label, tone }: { label: string; tone?: ChipTone }) { const t = tones[tone ?? toneFor(label)]; return <View style={[PS.chip, { backgroundColor: t.bg }]}><Text style={{ fontSize: 11, fontWeight: '600', color: t.ink }}>{label}</Text></View>; }
export type Cell = { text: string; flex?: number; align?: 'left' | 'right'; strong?: boolean };
export function DataRow({ cells, header = false, onPress, divider = true }: { cells: Cell[]; header?: boolean; onPress?: () => void; divider?: boolean }) {
  const content = <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: header ? 36 : 52, paddingVertical: header ? 6 : 10, borderBottomColor: C.line, borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0 }}>
    {cells.map((cell, index) => <Text key={index} numberOfLines={2} style={[PS.cell, { flex: cell.flex ?? 1, textAlign: cell.align ?? 'left' }, header && { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: C.muted, textTransform: 'uppercase' }, cell.strong && { fontWeight: '600' }]}>{cell.text}</Text>)}
  </View>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={cells.map(cell => cell.text).join(', ')} onPress={onPress}>{content}</Pressable> : content;
}
export function Drawer({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <SheetOverlay visible={visible} onClose={onClose} reduced={reduced !== false} title={title}>
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
      <Pressable testID="sheet-shade" accessibilityRole="button" accessibilityLabel="Close panel" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: '#10271C66' }]} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, height: '100%', backgroundColor: C.bg, padding: 24, paddingTop: 20, borderLeftColor: C.line, borderLeftWidth: 1 }}>
        <View style={[S.row, { marginBottom: 10 }]}><Text accessibilityRole="header" style={[S.heading, { flex: 1 }]}>{title}</Text><TextButton title="Close" onPress={onClose} /></View>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </View>
  </SheetOverlay>;
}
export function Badge({ count }: { count: number }) { return count > 0 ? <View accessibilityLabel={`${count} unread`} style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: P.cta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}><Text style={{ color: P.ctaInk, fontSize: 11, fontWeight: '700' }}>{count}</Text></View> : null; }
export function Dot({ tone }: { tone: 'green' | 'amber' | 'red' }) { return <View accessibilityElementsHidden style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tone === 'green' ? P.chipGreen : tone === 'amber' ? P.amber : P.red }} />; }
