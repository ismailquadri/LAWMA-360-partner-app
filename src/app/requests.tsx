import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../text';
import { Button, Card, Field, Header, ListRow, Notice, S, Sheet } from '../ui';
import { Chip, P, Page } from '../ui-partner';
import { money, useStore, type Pickup } from '../store';

export default function Requests() {
  const { model, acceptRequest, declineRequest, approveBinRequest, declineBinRequest } = useStore();
  const [acceptTarget, setAcceptTarget] = useState<Pickup | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Pickup | null>(null);
  const [binDeclineTarget, setBinDeclineTarget] = useState('');
  const [notice, setNotice] = useState('');
  const pendingPickups = model.customers.flatMap(c => c.pickups.filter(p => p.status === 'Requested').map(p => ({ pickup: p, customer: c })));
  const pendingBinRequests = model.binRequests.filter(b => b.status === 'Pending');
  return <Page>
    <Header eyebrow="Requests" title="Requests" sub="Pickup and bin allocation requests awaiting your action." />
    {notice ? <Notice text={notice} /> : null}
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Pickup requests</Text>
      {pendingPickups.length === 0 ? <Text style={[S.small, { marginTop: 12 }]}>No pending pickup requests. New customer requests will appear here for accept or decline.</Text> : pendingPickups.map(({ pickup, customer }) => (
        <View key={pickup.id} style={{ marginTop: 14, paddingTop: 2 }}>
          <View style={S.row}>
            <View style={{ flex: 1 }}><Text style={[S.body, { fontWeight: '600' }]}>{customer.name}</Text><Text style={[S.small, { marginTop: 2 }]}>{customer.address}, {customer.area}</Text></View>
            <Chip label={pickup.status} />
          </View>
          <Text style={[S.small, { marginTop: 8 }]}>Bin {customer.bins[0]?.id ?? '—'} · Requested window: {pickup.window} · Reserved {money(pickup.amount)}</Text>
          <View style={[S.row, { justifyContent: 'flex-start', marginTop: 12 }]}>
            <Button title="Accept" onPress={() => setAcceptTarget(pickup)} style={{ minHeight: 42, paddingVertical: 8, borderRadius: 12, backgroundColor: P.cta }} />
            <Button title="Decline" variant="outline" onPress={() => setDeclineTarget(pickup)} style={{ minHeight: 42, paddingVertical: 8, borderRadius: 12 }} />
          </View>
          <View style={S.divider} />
        </View>
      ))}
    </Card>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Bin allocation requests</Text>
      {pendingBinRequests.length === 0 ? <Text style={[S.small, { marginTop: 12 }]}>No pending bin requests. New or additional bin requests from customers will appear here.</Text> : pendingBinRequests.map(req => {
        const customer = model.customers.find(c => c.id === req.customerId);
        return <View key={req.id} style={{ marginTop: 14 }}>
          <View style={S.row}>
            <View style={{ flex: 1 }}><Text style={[S.body, { fontWeight: '600' }]}>{customer?.name ?? req.customerId}</Text><Text style={[S.small, { marginTop: 2 }]}>{customer?.address}, {customer?.area}</Text></View>
            <Chip label={req.kind === 'new' ? 'New bin' : 'Additional bin'} tone="neutral" />
          </View>
          <Text style={[S.small, { marginTop: 8 }]}>{req.size} L requested · {req.time}</Text>
          <View style={[S.row, { justifyContent: 'flex-start', marginTop: 12 }]}>
            <Button title="Approve & schedule delivery" onPress={() => { approveBinRequest(req.id); setNotice(`Bin request approved for ${customer?.name ?? 'customer'}. Delivery scheduled.`); }} style={{ minHeight: 42, paddingVertical: 8, borderRadius: 12, backgroundColor: P.cta }} />
            <Button title="Decline" variant="outline" onPress={() => setBinDeclineTarget(req.id)} style={{ minHeight: 42, paddingVertical: 8, borderRadius: 12 }} />
          </View>
        </View>;
      })}
    </Card>
    <AcceptSheet pickup={acceptTarget} onClose={() => setAcceptTarget(null)} onConfirm={(crewId, slot) => { if (acceptTarget) { acceptRequest(acceptTarget.id, crewId, slot); setNotice(`${acceptTarget.id} accepted and scheduled for ${slot}.`); } setAcceptTarget(null); }} />
    <DeclineSheet visible={!!declineTarget} title={declineTarget ? `Decline ${declineTarget.id}` : 'Decline request'} onClose={() => setDeclineTarget(null)} onConfirm={reason => { if (declineTarget) { declineRequest(declineTarget.id, reason); setNotice(`${declineTarget.id} declined. The customer's reservation was returned.`); } setDeclineTarget(null); }} />
    <DeclineSheet visible={!!binDeclineTarget} title="Decline bin request" onClose={() => setBinDeclineTarget('')} onConfirm={reason => { if (binDeclineTarget) { declineBinRequest(binDeclineTarget, reason); setNotice('Bin request declined. The customer has been notified.'); } setBinDeclineTarget(''); }} />
  </Page>;
}

function AcceptSheet({ pickup, onClose, onConfirm }: { pickup: Pickup | null; onClose: () => void; onConfirm: (crewId: string, slot: string) => void }) {
  const { model } = useStore();
  const [crewId, setCrewId] = useState('');
  const [slot, setSlot] = useState('');
  const chosenCrew = crewId || model.crews[0]?.id || '';
  const chosenSlot = slot || pickup?.window || '';
  return <Sheet visible={!!pickup} onClose={onClose} title={pickup ? `Accept ${pickup.id}` : 'Accept request'}>
    <Text style={S.label}>Crew</Text>
    {model.crews.map(crew => <ListRow key={crew.id} title={`${crew.name} · ${crew.plate}`} detail={crew.members.join(' · ')} right={chosenCrew === crew.id ? 'Selected' : undefined} onPress={() => setCrewId(crew.id)} />)}
    <Field label="Time slot" value={chosenSlot} onChangeText={setSlot} placeholder="e.g. Friday, 9 am–noon" />
    <View style={{ marginTop: 20, gap: 10 }}>
      <Button title="Confirm accept" disabled={!chosenCrew || !chosenSlot.trim()} onPress={() => { onConfirm(chosenCrew, chosenSlot.trim()); setCrewId(''); setSlot(''); }} style={{ backgroundColor: P.cta }} />
      <Button title="Cancel" variant="outline" onPress={onClose} />
    </View>
  </Sheet>;
}

function DeclineSheet({ visible, title, onClose, onConfirm }: { visible: boolean; title: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return <Sheet visible={visible} onClose={onClose} title={title}>
    <Field label="Reason" value={reason} onChangeText={setReason} placeholder="Let the customer know why" multiline />
    <View style={{ marginTop: 20, gap: 10 }}>
      <Button title="Confirm decline" onPress={() => { onConfirm(reason.trim() || 'Unable to fulfil at this time'); setReason(''); }} />
      <Button title="Cancel" variant="outline" onPress={onClose} />
    </View>
  </Sheet>;
}
