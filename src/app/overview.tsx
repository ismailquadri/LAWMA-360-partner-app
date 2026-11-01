import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../text';
import { Button, C, Card, Header, S } from '../ui';
import { Kpi, Page } from '../ui-partner';
import { money, useStore } from '../store';

export default function Overview() {
  const { model } = useStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const pendingRequests = model.customers.flatMap(c => c.pickups.filter(p => p.status === 'Requested')).length;
  const pendingBinRequests = model.binRequests.filter(b => b.status === 'Pending').length;
  const pickupsToday = model.routeStops.filter(s => !s.done).length;
  const activeBins = model.customers.reduce((n, c) => n + c.bins.filter(b => b.state === 'Active').length, 0);
  const totalCaptured = model.settlements.reduce((n, s) => n + s.partnerShare, 0);
  const openIssue = model.customers.some(c => c.status === 'Attention needed');
  const attention: { title: string; sub: string; action: string; route: string }[] = [
    ...(pendingRequests > 0 ? [{ title: `${pendingRequests} pickup request${pendingRequests > 1 ? 's' : ''}`, sub: 'Awaiting accept or decline', action: 'Review', route: '/requests' }] : []),
    ...(pendingBinRequests > 0 ? [{ title: `${pendingBinRequests} bin allocation request${pendingBinRequests > 1 ? 's' : ''}`, sub: 'Awaiting approval', action: 'Review', route: '/requests' }] : []),
    ...(model.earningsUncaptured > 0 ? [{ title: `${money(model.earningsUncaptured)} unpaid remittance`, sub: 'Due to LAWMA authority', action: 'Remit', route: '/finance' }] : []),
    ...(openIssue ? [{ title: 'Open customer issue', sub: 'A customer reported a problem', action: 'View', route: '/customers' }] : []),
  ];
  return <Page>
    <Header eyebrow="Partner console" title={`Good morning, ${model.profile.name}`} sub="Here is what is happening across your customers today." />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
      <Kpi label="Pending requests" value={String(pendingRequests + pendingBinRequests)} sub={`${pendingRequests} pickups · ${pendingBinRequests} bin requests`} />
      <Kpi label="Pickups today" value={String(pickupsToday)} sub="On the active route plan" />
      <Kpi label="Active bins" value={String(activeBins)} sub={`Across ${model.customers.length} customers`} />
      <Kpi label="Wallet earnings" value={money(totalCaptured)} sub="Remitted partner share to date" />
      <Kpi label="Due to LAWMA" value={money(model.earningsUncaptured)} sub={model.earningsUncaptured > 0 ? 'Remittance pending' : 'All settled'} />
    </View>
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 16 : 0, alignItems: wide ? 'flex-start' : 'stretch' }}>
      <Card style={{ flex: wide ? 1.2 : undefined }}>
        <Text accessibilityRole="header" style={S.heading}>Activity feed</Text>
        {model.activity.length === 0 ? <Text style={[S.small, { marginTop: 12 }]}>No recent activity.</Text> : model.activity.slice(0, 10).map((a, index) => (
          <View key={a.id} style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopColor: C.line, borderTopWidth: index === 0 ? 0 : 1, marginTop: index === 0 ? 12 : 0 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange, marginTop: 6 }} />
            <View style={{ flex: 1 }}><Text style={[S.body, { fontSize: 13, lineHeight: 19 }]}>{a.text}</Text><Text style={[S.small, { marginTop: 2 }]}>{a.time}</Text></View>
          </View>
        ))}
      </Card>
      <Card style={{ flex: wide ? 1 : undefined }}>
        <Text accessibilityRole="header" style={S.heading}>Needs attention</Text>
        {attention.length === 0 ? <Text style={[S.small, { marginTop: 12 }]}>Nothing urgent right now.</Text> : attention.map((item, index) => (
          <View key={item.title} style={[S.row, { paddingVertical: 12, borderTopColor: C.line, borderTopWidth: index === 0 ? 0 : 1, marginTop: index === 0 ? 10 : 0 }]}>
            <View style={{ flex: 1 }}><Text style={[S.body, { fontSize: 13, fontWeight: '600' }]}>{item.title}</Text><Text style={[S.small, { marginTop: 2 }]}>{item.sub}</Text></View>
            <Button title={item.action} variant="secondary" onPress={() => router.push(item.route as never)} style={{ minHeight: 40, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 }} />
          </View>
        ))}
      </Card>
    </View>
  </Page>;
}
