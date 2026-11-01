import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '../text';
import { Button, Card, Field, Header, Notice, S, Sheet, TextButton } from '../ui';
import { Chip, Dot, P, Page } from '../ui-partner';
import { money } from '../store';
import { useServiceSync, type Command } from '../service-sync';

export default function LiveLink() {
  const { session, status, statusText, doc, connect, disconnect, sendCommand } = useServiceSync();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [acceptTarget, setAcceptTarget] = useState('');
  const [declineTarget, setDeclineTarget] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [scheduleTarget, setScheduleTarget] = useState('');
  const [slot, setSlot] = useState('');
  const [reply, setReply] = useState('');
  const state = doc?.state;
  const tone = status === 'connected' ? 'green' : status === 'offline' || status === 'error' ? 'red' : 'amber';
  async function run(command: Command, after?: () => void) {
    const result = await sendCommand(command);
    setNotice(result.message);
    after?.();
  }
  return <Page>
    <Header eyebrow="Live Link" title="Live Link" sub="Connect to a customer’s live session to view and act on their shared record in real time." />
    {notice ? <Notice text={notice} /> : null}
    {!session ? <Card style={{ maxWidth: 480 }}>
      <Text accessibilityRole="header" style={S.heading}>Connect to a customer session</Text>
      <Text style={[S.small, { marginTop: 6 }]}>Paste the 32-character session code from the customer app’s Connection screen.</Text>
      <Field label="Session code" value={code} onChangeText={setCode} placeholder="e.g. a1b2c3d4e5f6…" />
      <View style={{ marginTop: 18 }}><Button title="Connect" disabled={!code.trim()} onPress={async () => { const ok = await connect(code); setNotice(ok ? 'Connecting to the shared session…' : 'Enter a valid 32-character session code.'); }} style={{ backgroundColor: P.cta }} /></View>
    </Card> : <>
      <Card>
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[S.row, { justifyContent: 'flex-start' }]}>
          <Dot tone={tone} />
          <Text style={[S.body, { fontSize: 13, flex: 1 }]}>{statusText}</Text>
          <TextButton title="Disconnect" onPress={() => { void disconnect(); setNotice('Disconnected. The customer record is no longer shared with this console.'); }} />
        </View>
      </Card>
      {!state ? <Card><Text style={[S.small]}>Waiting for the shared session. Polling the customer’s live document every 5 seconds.</Text></Card> : <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 16 : 0, alignItems: wide ? 'flex-start' : 'stretch' }}>
        <View style={{ flex: wide ? 1.3 : undefined }}>
          <Card>
            <Text accessibilityRole="header" style={S.heading}>Live pickups</Text>
            {state.pickups.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No pickups yet. Pickup requests from the customer will appear here.</Text> : state.pickups.map(p => (
              <View key={p.id} style={{ marginTop: 12 }}>
                <View style={S.row}>
                  <View style={{ flex: 1 }}><Text style={[S.body, { fontSize: 13, fontWeight: '600' }]}>{p.id} · {money(p.amount)}</Text><Text style={[S.small, { marginTop: 2 }]}>{p.window} · {p.partner}</Text></View>
                  <Chip label={p.status} />
                </View>
                {p.status === 'Requested' ? <View style={[S.row, { justifyContent: 'flex-start', marginTop: 10 }]}>
                  <Button title="Accept" onPress={() => setAcceptTarget(p.id)} style={{ minHeight: 40, paddingVertical: 7, borderRadius: 12, backgroundColor: P.cta }} />
                  <Button title="Decline" variant="outline" onPress={() => setDeclineTarget(p.id)} style={{ minHeight: 40, paddingVertical: 7, borderRadius: 12 }} />
                </View> : null}
                {p.status === 'Accepted' ? <View style={{ alignSelf: 'flex-start', marginTop: 10 }}><Button title="Schedule" variant="secondary" onPress={() => { setScheduleTarget(p.id); setSlot(p.window); }} style={{ minHeight: 40, paddingVertical: 7, borderRadius: 12 }} /></View> : null}
              </View>
            ))}
          </Card>
          <Card>
            <Text accessibilityRole="header" style={S.heading}>Bins</Text>
            {state.bins.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No bins yet. The customer’s bins will appear here once allocated.</Text> : state.bins.map(b => (
              <View key={b.id} style={[S.row, { marginTop: 10 }]}><Text style={[S.body, { fontSize: 13 }]}>{b.id} · {b.size} L</Text><Chip label={b.state} /></View>
            ))}
          </Card>
        </View>
        <View style={{ flex: wide ? 1 : undefined }}>
          <Card>
            <Text accessibilityRole="header" style={S.heading}>Wallet</Text>
            <View style={[S.row, { marginTop: 12 }]}><Text style={S.small}>Balance</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(state.balance)}</Text></View>
            <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Reserved</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(state.reserved)}</Text></View>
          </Card>
          <Card>
            <Text accessibilityRole="header" style={S.heading}>Notices</Text>
            {state.notices.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No notices yet.</Text> : state.notices.slice(0, 6).map((n, index) => <Text key={index} style={[S.small, { marginTop: 8 }]}>• {n}</Text>)}
          </Card>
          <Card>
            <Text accessibilityRole="header" style={S.heading}>Message the customer</Text>
            <Field label="Reply" value={reply} onChangeText={setReply} placeholder="Send a service message to the customer" multiline />
            <View style={{ marginTop: 14 }}><Button title="Send reply" disabled={!reply.trim()} onPress={() => run({ action: 'reply', detail: reply.trim() }, () => setReply(''))} style={{ backgroundColor: P.cta }} /></View>
          </Card>
        </View>
      </View>}
    </>}
    <Sheet visible={!!acceptTarget} onClose={() => setAcceptTarget('')} title={`Accept ${acceptTarget}`}>
      <Text style={[S.body, { marginTop: 8 }]}>This sends an accept command to the customer’s live session. Their app will update immediately and the reserved amount is marked paid to you.</Text>
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Confirm accept" onPress={() => run({ action: 'accept', id: acceptTarget }, () => setAcceptTarget(''))} style={{ backgroundColor: P.cta }} />
        <Button title="Cancel" variant="outline" onPress={() => setAcceptTarget('')} />
      </View>
    </Sheet>
    <Sheet visible={!!declineTarget} onClose={() => setDeclineTarget('')} title={`Decline ${declineTarget}`}>
      <Field label="Reason" value={declineReason} onChangeText={setDeclineReason} placeholder="Let the customer know why" multiline />
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Confirm decline" onPress={() => run({ action: 'decline', id: declineTarget, detail: declineReason.trim() || 'Unable to fulfil at this time' }, () => { setDeclineTarget(''); setDeclineReason(''); })} />
        <Button title="Cancel" variant="outline" onPress={() => setDeclineTarget('')} />
      </View>
    </Sheet>
    <Sheet visible={!!scheduleTarget} onClose={() => setScheduleTarget('')} title={`Schedule ${scheduleTarget}`}>
      <Field label="Time slot" value={slot} onChangeText={setSlot} placeholder="e.g. Friday, 9 am–noon" />
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Confirm schedule" disabled={!slot.trim()} onPress={() => run({ action: 'schedule', id: scheduleTarget, detail: slot.trim() }, () => setScheduleTarget(''))} style={{ backgroundColor: P.cta }} />
        <Button title="Cancel" variant="outline" onPress={() => setScheduleTarget('')} />
      </View>
    </Sheet>
  </Page>;
}
