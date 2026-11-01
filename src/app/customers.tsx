import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../text';
import { Card, Field, Header, S, TextButton } from '../ui';
import { Chip, DataRow, Drawer, Page } from '../ui-partner';
import { money, useStore, type Customer } from '../store';

export default function Customers() {
  const { model, customerById, resolveIssue } = useStore();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return model.customers;
    return model.customers.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.area.toLowerCase().includes(q));
  }, [model.customers, query]);
  const open = customerById(openId);
  return <Page>
    <Header eyebrow="Customers" title="Customers" sub={`${model.customers.length} customers across your service areas.`} />
    <View style={{ maxWidth: 380 }}><Field label="Search" value={query} onChangeText={setQuery} placeholder="Search by name, address, or area" /></View>
    <Card>
      {filtered.length === 0 ? <Text style={S.small}>No matching customers. Try a different name, address, or area.</Text> : <>
        <DataRow header cells={[{ text: 'Name', flex: 1.2 }, { text: 'Address', flex: 1.6 }, { text: 'Bins', flex: 0.5 }, { text: 'Wallet balance', flex: 0.9, align: 'right' }, { text: 'Status', flex: 0.9, align: 'right' }]} />
        {filtered.map((c, index) => <DataRow key={c.id} divider={index < filtered.length - 1} onPress={() => setOpenId(c.id)}
          cells={[{ text: c.name, flex: 1.2, strong: true }, { text: `${c.address}, ${c.area}`, flex: 1.6 }, { text: String(c.bins.length), flex: 0.5 }, { text: money(c.balance), flex: 0.9, align: 'right' }, { text: c.status, flex: 0.9, align: 'right' }]} />)}
      </>}
    </Card>
    <Drawer visible={!!open} onClose={() => setOpenId('')} title={open?.name ?? 'Customer'}>
      {open ? <CustomerDetail customer={open} onResolve={(issueId, reply) => resolveIssue(open.id, issueId, reply)} /> : null}
    </Drawer>
  </Page>;
}

function CustomerDetail({ customer, onResolve }: { customer: Customer; onResolve: (issueId: string, reply: string) => void }) {
  return <View style={{ paddingBottom: 24 }}>
    <View style={S.row}><Text style={S.small}>{customer.address}, {customer.area} · {customer.phone}</Text><Chip label={customer.status} /></View>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Wallet</Text>
      <View style={[S.row, { marginTop: 12 }]}><Text style={S.small}>Balance</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(customer.balance)}</Text></View>
      <View style={[S.row, { marginTop: 8 }]}><Text style={S.small}>Reserved</Text><Text style={[S.body, { fontWeight: '600' }]}>{money(customer.reserved)}</Text></View>
    </Card>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Bins</Text>
      {customer.bins.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No bins allocated yet.</Text> : customer.bins.map(b => (
        <View key={b.id} style={[S.row, { marginTop: 10 }]}><Text style={[S.body, { fontSize: 13 }]}>{b.id} · {b.size} L</Text><Chip label={b.state} /></View>
      ))}
    </Card>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Pickup history</Text>
      {customer.pickups.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No pickups yet.</Text> : customer.pickups.map(p => (
        <View key={p.id} style={[S.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}><Text style={[S.body, { fontSize: 13 }]}>{p.id} · {money(p.amount)}</Text><Text style={[S.small, { marginTop: 2 }]}>{p.window} · {p.created}</Text></View>
          <Chip label={p.status} />
        </View>
      ))}
    </Card>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Wallet activity</Text>
      {customer.entries.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No wallet activity yet.</Text> : customer.entries.slice(0, 8).map(e => (
        <View key={e.id} style={{ marginTop: 10 }}><Text style={[S.body, { fontSize: 13 }]}>{e.title}</Text><Text style={[S.small, { marginTop: 2 }]}>{e.time}</Text></View>
      ))}
    </Card>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Support messages</Text>
      {customer.supportMessages.length === 0 ? <Text style={[S.small, { marginTop: 10 }]}>No messages yet.</Text> : customer.supportMessages.map(m => (
        <Text key={m.id} style={[S.body, { fontSize: 13, marginTop: 10 }]}><Text style={{ fontWeight: '600' }}>{m.role === 'customer' ? customer.name : 'You'}:</Text> {m.text}</Text>
      ))}
    </Card>
    {customer.issues.length > 0 ? <Card>
      <Text accessibilityRole="header" style={S.heading}>Issues</Text>
      {customer.issues.map(issue => (
        <View key={issue.id} style={{ marginTop: 10 }}>
          <View style={S.row}>
            <View style={{ flex: 1 }}><Text style={[S.body, { fontSize: 13, fontWeight: '600' }]}>{issue.type}</Text><Text style={[S.small, { marginTop: 2 }]}>{issue.detail}</Text></View>
            <Chip label={issue.status} />
          </View>
          {issue.reply ? <Text style={[S.small, { marginTop: 6 }]}>Reply: {issue.reply}</Text> : issue.status !== 'Resolved' ? <View style={{ alignSelf: 'flex-start' }}><TextButton title="Mark resolved with apology" onPress={() => onResolve(issue.id, 'We apologise for the missed window. The next collection is prioritised.')} /></View> : null}
        </View>
      ))}
    </Card> : null}
  </View>;
}
