import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { Text } from '../text';
import { Button, C, Card, Field, Header, Notice, S, Sheet } from '../ui';
import { P, Page } from '../ui-partner';
import { useStore } from '../store';

export default function Settings() {
  const { model, updateProfile, reset } = useStore();
  const [name, setName] = useState(model.profile.name);
  const [areas, setAreas] = useState(model.profile.areas);
  const [contact, setContact] = useState(model.profile.contact);
  const [notice, setNotice] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  return <Page>
    <Header eyebrow="Settings" title="Settings" sub="Partner profile, notifications, and demonstration controls." />
    {notice ? <Notice text={notice} /> : null}
    <Card style={{ maxWidth: 520 }}>
      <Text accessibilityRole="header" style={S.heading}>Partner profile</Text>
      <Field label="Business name" value={name} onChangeText={setName} placeholder="Business name" />
      <Field label="Service areas" value={areas} onChangeText={setAreas} placeholder="Service areas" />
      <Field label="Contact" value={contact} onChangeText={setContact} placeholder="Contact" />
      <View style={{ marginTop: 20 }}><Button title="Save changes" onPress={() => { updateProfile({ name: name.trim(), areas: areas.trim(), contact: contact.trim() }); setNotice('Partner profile updated.'); }} style={{ backgroundColor: P.cta }} /></View>
    </Card>
    <Card style={{ maxWidth: 520 }}>
      <Text accessibilityRole="header" style={S.heading}>Notifications</Text>
      <ToggleRow label="New requests" value={model.profile.notifyRequests} onChange={value => updateProfile({ notifyRequests: value })} />
      <ToggleRow label="Customer messages" value={model.profile.notifyMessages} onChange={value => updateProfile({ notifyMessages: value })} />
      <ToggleRow label="Remittance reminders" value={model.profile.notifyRemittance} onChange={value => updateProfile({ notifyRemittance: value })} />
    </Card>
    <Card style={{ maxWidth: 520 }}>
      <Text accessibilityRole="header" style={S.heading}>Demonstration</Text>
      <Text style={[S.small, { marginTop: 6 }]}>Resets all customers, requests, operations, and finance data back to the seeded demo state.</Text>
      <View style={{ marginTop: 16 }}><Button title="Reset demonstration" variant="outline" onPress={() => setConfirmingReset(true)} /></View>
    </Card>
    <Text style={[S.small, { textAlign: 'center', marginTop: 28 }]}>Demonstration · fictional records</Text>
    <Sheet visible={confirmingReset} onClose={() => setConfirmingReset(false)} title="Reset demonstration?">
      <Text style={[S.body, { marginTop: 8 }]}>This clears all local demo data and reseeds the original fictional records. This cannot be undone.</Text>
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Reset" onPress={() => { reset(); setConfirmingReset(false); setName('Mainland Clean Services'); setAreas('Ikeja · Yaba · Ajah · Lekki'); setContact('ops@mainlandclean.ng · 0700 000 1500'); setNotice('Demonstration reset.'); }} />
        <Button title="Cancel" variant="outline" onPress={() => setConfirmingReset(false)} />
      </View>
    </Sheet>
  </Page>;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={[S.row, { minHeight: 48, marginTop: 8 }]}>
    <Text style={[S.body, { fontSize: 14 }]}>{label}</Text>
    <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: C.green, false: C.line }} thumbColor="#FFFFFF" />
  </View>;
}
