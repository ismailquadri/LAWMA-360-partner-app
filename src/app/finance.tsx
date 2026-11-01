import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../text';
import { Button, Card, Confirmation, Header, S, Sheet } from '../ui';
import { DataRow, Kpi, P, Page } from '../ui-partner';
import { money, useStore, type Settlement } from '../store';

const PARTNER_PCT = 80;
const AUTHORITY_PCT = 20;

export default function Finance() {
  const { model, remitToLawma } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState<Settlement | null>(null);
  const partnerShare = Math.round(model.earningsUncaptured * (PARTNER_PCT / 100));
  const authorityShare = model.earningsUncaptured - partnerShare;
  const capturedEntries = model.customers.flatMap(c => c.entries.filter(e => e.kind === 'paid' || e.title.toLowerCase().includes('bin')).map(e => ({ ...e, customer: c.name }))).sort((a, b) => (a.time < b.time ? 1 : -1));
  return <Page>
    <Header eyebrow="Finance" title="Finance" sub="Earnings ledger, revenue split, and remittance to LAWMA." />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
      <Kpi label="Accumulated due to LAWMA" value={money(model.earningsUncaptured)} sub="Since last remittance" />
      <Kpi label={`Partner share (${PARTNER_PCT}%)`} value={money(partnerShare)} sub={`Retained by ${model.profile.name}`} />
      <Kpi label={`Authority share (${AUTHORITY_PCT}%)`} value={money(authorityShare)} sub="Owed to LAWMA" />
    </View>
    <Card>
      <View style={S.row}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={S.heading}>Remit to LAWMA</Text>
          <Text style={[S.small, { marginTop: 4 }]}>Settle the accumulated authority share for completed pickups and bin deliveries.</Text>
        </View>
        <Button title="Remit now" disabled={model.earningsUncaptured === 0} onPress={() => setConfirming(true)} style={{ backgroundColor: P.cta, minHeight: 46, paddingVertical: 10, borderRadius: 13 }} />
      </View>
    </Card>
    <Card>
      <Text accessibilityRole="header" style={[S.heading, { marginBottom: 8 }]}>Earnings ledger</Text>
      {capturedEntries.length === 0 ? <Text style={[S.small, { marginTop: 4 }]}>No captured earnings yet. Completed pickups and bin deliveries will appear here.</Text> : <>
        <DataRow header cells={[{ text: 'Customer', flex: 0.9 }, { text: 'Description', flex: 1.8 }, { text: 'Time', flex: 1, align: 'right' }]} />
        {capturedEntries.slice(0, 12).map((e, index) => <DataRow key={e.id} divider={index < Math.min(capturedEntries.length, 12) - 1} cells={[{ text: e.customer, flex: 0.9, strong: true }, { text: e.title, flex: 1.8 }, { text: e.time, flex: 1, align: 'right' }]} />)}
      </>}
    </Card>
    <Card>
      <Text accessibilityRole="header" style={[S.heading, { marginBottom: 8 }]}>Settlements history</Text>
      {model.settlements.length === 0 ? <Text style={[S.small, { marginTop: 4 }]}>No settlements yet. Remittance receipts will be listed here.</Text> : <>
        <DataRow header cells={[{ text: 'Reference', flex: 1 }, { text: 'Date', flex: 1.1 }, { text: 'Amount', flex: 0.8, align: 'right' }, { text: 'Partner share', flex: 0.8, align: 'right' }, { text: 'Authority share', flex: 0.8, align: 'right' }]} />
        {model.settlements.map((s, index) => <DataRow key={s.ref} divider={index < model.settlements.length - 1} cells={[{ text: s.ref, flex: 1, strong: true }, { text: s.date, flex: 1.1 }, { text: money(s.amount), flex: 0.8, align: 'right' }, { text: money(s.partnerShare), flex: 0.8, align: 'right' }, { text: money(s.authorityShare), flex: 0.8, align: 'right' }]} />)}
      </>}
    </Card>
    <Sheet visible={confirming} onClose={() => setConfirming(false)} title="Confirm remittance">
      <Text style={[S.body, { marginTop: 8 }]}>You are about to remit <Text style={{ fontWeight: '600' }}>{money(model.earningsUncaptured)}</Text> to LAWMA ({money(partnerShare)} partner share retained, {money(authorityShare)} authority share transferred). This will reset your accumulated balance to zero.</Text>
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Confirm & remit" onPress={() => { const settlement = remitToLawma(); setConfirming(false); setReceipt(settlement); }} style={{ backgroundColor: P.cta }} />
        <Button title="Cancel" variant="outline" onPress={() => setConfirming(false)} />
      </View>
    </Sheet>
    <Sheet visible={!!receipt} onClose={() => setReceipt(null)} title="Remittance receipt">
      {receipt ? <>
        <View style={{ marginTop: 6 }}>
          <View style={S.row}><Text style={S.small}>Reference</Text><Text style={[S.body, { fontWeight: '600' }]}>{receipt.ref}</Text></View>
          <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Date</Text><Text style={[S.body, { fontWeight: '600' }]}>{receipt.date}</Text></View>
          <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Amount</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(receipt.amount)}</Text></View>
          <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Partner share</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(receipt.partnerShare)}</Text></View>
          <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Authority share</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(receipt.authorityShare)}</Text></View>
        </View>
        <Confirmation title="Remitted to LAWMA" detail={`${receipt.ref} recorded in your settlements history. The revenue team will confirm the transfer.`} onClose={() => setReceipt(null)} />
      </> : null}
    </Sheet>
  </Page>;
}
