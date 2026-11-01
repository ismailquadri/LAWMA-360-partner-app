import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../text';
import { Button, C, Card, Header, Notice, S } from '../ui';
import { Chip, Kpi, Page } from '../ui-partner';
import { money, useStore } from '../store';

export default function Operations() {
  const { model, completeStop, customerById } = useStore();
  const [notice, setNotice] = useState('');
  return <Page>
    <Header eyebrow="Operations" title="Operations" sub="Today's crew roster and route plan." />
    {notice ? <Notice text={notice} /> : null}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
      {model.crews.map(crew => {
        const stops = model.routeStops.filter(s => s.crewId === crew.id);
        const done = stops.filter(s => s.done).length;
        return <Kpi key={crew.id} label={crew.name} value={`${done}/${stops.length} stops`} sub={`${crew.plate} · ${crew.members.join(' · ')}`} />;
      })}
    </View>
    <Card>
      <Text accessibilityRole="header" style={S.heading}>Route list</Text>
      {model.routeStops.length === 0 ? <Text style={[S.small, { marginTop: 12 }]}>No stops scheduled. Accept pickup requests to build today’s route.</Text> : model.routeStops.map((stop, index) => {
        const crew = model.crews.find(c => c.id === stop.crewId);
        const customer = customerById(stop.customerId);
        const pickup = customer?.pickups.find(p => p.id === stop.pickupId);
        return <View key={stop.id} style={{ paddingVertical: 14, borderTopColor: C.line, borderTopWidth: index === 0 ? 0 : 1, marginTop: index === 0 ? 8 : 0, opacity: stop.done ? 0.6 : 1 }}>
          <View style={S.row}>
            <View style={{ flex: 1 }}>
              <Text style={[S.body, { fontWeight: '600' }]}>{customer?.name ?? stop.customerId}</Text>
              <Text style={[S.small, { marginTop: 2 }]}>{stop.address} · {stop.window} · {crew?.name} ({crew?.plate})</Text>
              {pickup ? <Text style={[S.small, { marginTop: 2 }]}>{pickup.id} · {money(pickup.amount)}</Text> : null}
            </View>
            <Chip label={stop.done ? 'Completed' : 'Scheduled'} />
            <Button title="Mark complete" variant="secondary" disabled={stop.done} onPress={() => { completeStop(stop.id); setNotice(`Stop completed for ${customer?.name ?? 'customer'} · ${money(pickup?.amount ?? 0)} captured to earnings.`); }} style={{ minHeight: 42, paddingVertical: 8, borderRadius: 12 }} />
          </View>
        </View>;
      })}
    </Card>
  </Page>;
}
