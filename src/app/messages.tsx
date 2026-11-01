import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../text';
import { Back, Button, C, Card, Field, Header, S } from '../ui';
import { Badge, P, Page } from '../ui-partner';
import { useStore } from '../store';

export default function Messages() {
  const { model, sendMessageToCustomer, sendMessageToLawma } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [activeId, setActiveId] = useState<string>(wide ? 'lawma' : '');
  const [draft, setDraft] = useState('');
  const [seen, setSeen] = useState<Record<string, number>>({});
  const scrollRef = useRef<ScrollView>(null);
  const customerThreads = model.customers.filter(c => c.supportMessages.length > 0);
  const activeCustomer = activeId && activeId !== 'lawma' ? model.customers.find(c => c.id === activeId) : undefined;
  const messages = activeId === 'lawma' ? model.lawmaThread : activeCustomer?.supportMessages ?? [];
  const countOf = (threadId: string) => threadId === 'lawma' ? model.lawmaThread.length : model.customers.find(c => c.id === threadId)?.supportMessages.length ?? 0;
  const unreadOf = (threadId: string) => threadId === activeId ? 0 : Math.max(0, countOf(threadId) - (seen[threadId] ?? 0));
  function openThread(threadId: string) {
    setSeen(s => ({ ...s, ...(activeId ? { [activeId]: countOf(activeId) } : {}), ...(threadId ? { [threadId]: countOf(threadId) } : {}) }));
    setActiveId(threadId);
  }
  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: false }); }, [activeId, messages.length]);
  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    if (activeId === 'lawma') sendMessageToLawma(text);
    else if (activeCustomer) sendMessageToCustomer(activeCustomer.id, text);
  }
  const threadList = <Card style={{ flex: wide ? 0.9 : undefined, padding: 12 }}>
    <ThreadRow name="LAWMA Management" pinned active={activeId === 'lawma'} onPress={() => openThread('lawma')} preview={model.lawmaThread[model.lawmaThread.length - 1]?.text ?? 'No messages yet'} unread={unreadOf('lawma')} />
    {customerThreads.map(c => <ThreadRow key={c.id} name={c.name} active={activeId === c.id} onPress={() => openThread(c.id)} preview={c.supportMessages[c.supportMessages.length - 1]?.text ?? ''} unread={unreadOf(c.id)} />)}
    {customerThreads.length === 0 ? <Text style={[S.small, { padding: 10 }]}>No customer conversations yet.</Text> : null}
  </Card>;
  const conversation = <Card style={{ flex: wide ? 1.6 : undefined }}>
    <Text accessibilityRole="header" style={S.heading}>{activeId === 'lawma' ? 'LAWMA Management' : activeCustomer?.name ?? 'Conversation'}</Text>
    <ScrollView ref={scrollRef} style={{ maxHeight: 360, marginTop: 12 }} showsVerticalScrollIndicator={false} accessibilityLiveRegion="polite">
      {messages.length === 0 ? <Text style={[S.small, { paddingVertical: 20 }]}>No messages in this thread yet.</Text> : messages.map(m => {
        const mine = activeId === 'lawma' ? m.role === 'customer' : m.role === 'assistant';
        return <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '84%', backgroundColor: mine ? C.pale : C.paper, borderColor: C.line, borderWidth: mine ? 0 : 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}>
          <Text style={[S.body, { fontSize: 13, lineHeight: 19 }]}>{m.text}</Text>
          {m.time ? <Text style={[S.small, { fontSize: 11, marginTop: 3 }]}>{m.time}</Text> : null}
        </View>;
      })}
    </ScrollView>
    <Field label="Message" value={draft} onChangeText={setDraft} placeholder={activeId === 'lawma' ? 'Message LAWMA Management…' : `Reply to ${activeCustomer?.name ?? 'customer'}…`} />
    <View style={{ marginTop: 12, alignSelf: 'flex-end' }}><Button title="Send" disabled={!draft.trim()} onPress={send} style={{ minHeight: 44, paddingVertical: 9, paddingHorizontal: 26, borderRadius: 13, backgroundColor: P.cta }} /></View>
  </Card>;
  return <Page>
    <Header eyebrow="Messages" title="Messages" sub="LAWMA management and customer support threads." />
    {wide ? <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>{threadList}{conversation}</View>
      : activeId ? <><Back onPress={() => openThread('')} label="All conversations" />{conversation}</> : threadList}
  </Page>;
}

function ThreadRow({ name, preview, unread, active, pinned, onPress }: { name: string; preview: string; unread: number; active: boolean; pinned?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${name}${pinned ? ', pinned' : ''}${unread ? `, ${unread} unread` : ''}`} accessibilityState={{ selected: active }} onPress={onPress}
    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: active ? C.pale : 'transparent', opacity: pressed ? 0.7 : 1 })}>
    <View style={{ flex: 1 }}>
      <Text style={[S.body, { fontSize: 13, fontWeight: '600' }]}>{name}{pinned ? ' · Pinned' : ''}</Text>
      <Text numberOfLines={1} style={[S.small, { marginTop: 2 }]}>{preview}</Text>
    </View>
    <Badge count={unread} />
  </Pressable>;
}
