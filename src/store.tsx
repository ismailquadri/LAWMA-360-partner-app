import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Mirrors the vocabulary of customer-app/src/store.tsx so the Live Link
// protocol and demo data stay consistent across both apps.
export type Bin = { id: string; size: number; state: 'Requested' | 'Allocated' | 'Out for delivery' | 'Delivered' | 'Active' };
export type Pickup = { id: string; status: 'Requested' | 'Accepted' | 'Scheduled' | 'Collected' | 'Completed' | 'Declined' | 'Cancelled'; amount: number; created: string; window: string; partner: string; evidence?: string; customerId: string; crew?: string };
export type Entry = { id: string; title: string; amount: number; time: string; kind: 'credit' | 'reserved' | 'paid' | 'released' };
export type Issue = { id: string; type: string; detail: string; status: 'Open' | 'In review' | 'Resolved'; time: string; reply?: string };
export type SupportMessage = { id: string; role: 'assistant' | 'customer'; text: string; time?: string };
export type BinRequest = { id: string; customerId: string; kind: 'new' | 'additional'; size: number; status: 'Pending' | 'Approved' | 'Declined'; time: string };
export type Customer = { id: string; name: string; address: string; area: 'Ajah' | 'Ikeja' | 'Lekki'; phone: string; status: 'Active' | 'Attention needed'; bins: Bin[]; balance: number; reserved: number; pickups: Pickup[]; entries: Entry[]; issues: Issue[]; notices: string[]; supportMessages: SupportMessage[] };
export type Crew = { id: string; name: string; plate: string; members: string[] };
export type RouteStop = { id: string; crewId: string; customerId: string; pickupId: string; address: string; window: string; done: boolean };
export type Settlement = { ref: string; date: string; amount: number; partnerShare: number; authorityShare: number };
export type ActivityEvent = { id: string; time: string; text: string; customerId?: string };
export type PartnerProfile = { name: string; areas: string; contact: string; notifyRequests: boolean; notifyMessages: boolean; notifyRemittance: boolean };
export type Model = { customers: Customer[]; crews: Crew[]; routeStops: RouteStop[]; binRequests: BinRequest[]; settlements: Settlement[]; activity: ActivityEvent[]; lawmaThread: SupportMessage[]; earningsUncaptured: number; binDeliveryUntil: number; lawmaAckAt: number; profile: PartnerProfile };

const seedStamp = (offsetMinutes = 0) => new Date(Date.now() - offsetMinutes * 60000).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
const seed = (): Model => ({
  customers: [
    { id: 'CUS-071-ADA', name: 'Ada Okafor', address: '71 Ajah Gardens', area: 'Ajah', phone: '0803 555 0171', status: 'Active', bins: [{ id: 'BIN-710071', size: 240, state: 'Active' }], balance: 3200, reserved: 1500,
      pickups: [{ id: 'PU-710001', status: 'Requested', amount: 1500, created: seedStamp(40), window: 'Friday, 9 am–noon', partner: 'Mainland Clean Services', customerId: 'CUS-071-ADA' }],
      entries: [{ id: 'RSV-710001', title: 'Reserved for PU-710001', amount: -1500, time: seedStamp(40), kind: 'reserved' }, { id: 'TOP-710001', title: 'Wallet top-up · Card', amount: 5000, time: seedStamp(120), kind: 'credit' }],
      issues: [], notices: ['PU-710001 requested. ₦1,500 is reserved until partner acceptance or decline.'],
      supportMessages: [{ id: 'MSG-710001', role: 'customer', text: 'Hi, can my Friday pickup come before noon? I have an appointment.', time: seedStamp(35) }] },
    { id: 'CUS-018-TUNDE', name: 'Tunde Bakare', address: '18 Olowu Street', area: 'Ikeja', phone: '0805 221 9087', status: 'Active', bins: [{ id: 'BIN-180018', size: 120, state: 'Active' }], balance: 900, reserved: 1450,
      pickups: [{ id: 'PU-180002', status: 'Requested', amount: 1450, created: seedStamp(55), window: 'Tomorrow, 8–11 am', partner: 'Mainland Clean Services', customerId: 'CUS-018-TUNDE' }],
      entries: [{ id: 'RSV-180002', title: 'Reserved for PU-180002', amount: -1450, time: seedStamp(55), kind: 'reserved' }], issues: [], notices: [], supportMessages: [] },
    { id: 'CUS-042-CHIOMA', name: 'Chioma Eze', address: '4 Mainland Court', area: 'Ikeja', phone: '0701 334 7721', status: 'Active', bins: [{ id: 'BIN-1042', size: 240, state: 'Active' }, { id: 'BIN-1043', size: 240, state: 'Active' }], balance: 2100, reserved: 0,
      pickups: [{ id: 'PU-104201', status: 'Scheduled', amount: 1500, created: seedStamp(300), window: 'Thursday, 1–4 pm', partner: 'Mainland Clean Services', customerId: 'CUS-042-CHIOMA', crew: 'CREW-02' }],
      entries: [{ id: 'RSV-104201', title: 'Reserved for PU-104201', amount: -1500, time: seedStamp(300), kind: 'reserved' }], issues: [], notices: [], supportMessages: [] },
    { id: 'CUS-200-FOLA', name: 'Folasade Adigun', address: '12 Marwa Close', area: 'Lekki', phone: '0902 441 2290', status: 'Active', bins: [{ id: 'BIN-200201', size: 240, state: 'Active' }], balance: 4800, reserved: 0,
      pickups: [{ id: 'PU-200101', status: 'Completed', amount: 1500, created: seedStamp(2800), window: 'Monday, 9 am–noon', partner: 'Mainland Clean Services', customerId: 'CUS-200-FOLA', crew: 'CREW-01', evidence: 'CREW-EVIDENCE-01 · collection evidence recorded' }],
      entries: [{ id: 'PAY-200101', title: 'Partner credited ₦1,500 · PU-200101', amount: 0, time: seedStamp(2790), kind: 'paid' }], issues: [], notices: [], supportMessages: [] },
    { id: 'CUS-210-KUNLE', name: 'Kunle Oyelaran', address: '5B Chevron Drive', area: 'Lekki', phone: '0813 667 4420', status: 'Active', bins: [{ id: 'BIN-210301', size: 120, state: 'Active' }], balance: 1300, reserved: 0,
      pickups: [{ id: 'PU-210301', status: 'Completed', amount: 1450, created: seedStamp(4200), window: 'Tuesday, 2–5 pm', partner: 'Mainland Clean Services', customerId: 'CUS-210-KUNLE', crew: 'CREW-03', evidence: 'CREW-EVIDENCE-01 · collection evidence recorded' }],
      entries: [{ id: 'PAY-210301', title: 'Partner credited ₦1,450 · PU-210301', amount: 0, time: seedStamp(4190), kind: 'paid' }], issues: [], notices: [], supportMessages: [] },
    { id: 'CUS-088-IBRAHIM', name: 'Ibrahim Suleiman', address: '9 Freedom Way', area: 'Lekki', phone: '0906 220 3341', status: 'Attention needed', bins: [{ id: 'BIN-088401', size: 240, state: 'Active' }], balance: 600, reserved: 1500,
      pickups: [{ id: 'PU-088401', status: 'Scheduled', amount: 1500, created: seedStamp(600), window: 'Wednesday, 10 am–1 pm', partner: 'Mainland Clean Services', customerId: 'CUS-088-IBRAHIM', crew: 'CREW-01' }],
      entries: [{ id: 'RSV-088401', title: 'Reserved for PU-088401', amount: -1500, time: seedStamp(600), kind: 'reserved' }],
      issues: [{ id: 'CASE-088001', type: 'Missed collection', detail: 'Crew did not arrive during the scheduled window last week.', status: 'Open', time: seedStamp(800) }], notices: [],
      supportMessages: [{ id: 'MSG-088001', role: 'customer', text: 'This is the second time the crew has skipped my street. Please advise.', time: seedStamp(790) }] },
    { id: 'CUS-065-NGOZI', name: 'Ngozi Umeh', address: '23 Peace Estate', area: 'Ajah', phone: '0708 552 6610', status: 'Active', bins: [], balance: 1800, reserved: 0, pickups: [], entries: [], issues: [], notices: [], supportMessages: [] },
    { id: 'CUS-150-EMEKA', name: 'Emeka Nwosu', address: '31 Allen Avenue', area: 'Ikeja', phone: '0816 773 9902', status: 'Active', bins: [{ id: 'BIN-150501', size: 240, state: 'Active' }], balance: 2500, reserved: 0, pickups: [], entries: [], issues: [], notices: [], supportMessages: [] },
  ],
  crews: [
    { id: 'CREW-01', name: 'Crew Alpha', plate: 'LND 221 KJA', members: ['Bashir A.', 'Femi O.'] },
    { id: 'CREW-02', name: 'Crew Beta', plate: 'LND 884 XQ', members: ['Rasheed T.', 'Chidi N.'] },
    { id: 'CREW-03', name: 'Crew Gamma', plate: 'LND 017 YB', members: ['Grace I.', 'Musa D.'] },
  ],
  routeStops: [
    { id: 'STOP-01', crewId: 'CREW-02', customerId: 'CUS-042-CHIOMA', pickupId: 'PU-104201', address: '4 Mainland Court, Ikeja', window: 'Thursday, 1–4 pm', done: false },
    { id: 'STOP-02', crewId: 'CREW-01', customerId: 'CUS-088-IBRAHIM', pickupId: 'PU-088401', address: '9 Freedom Way, Lekki', window: 'Wednesday, 10 am–1 pm', done: false },
  ],
  binRequests: [{ id: 'BINREQ-01', customerId: 'CUS-065-NGOZI', kind: 'new', size: 240, status: 'Pending', time: seedStamp(90) }],
  settlements: [{ ref: 'SET-220001', date: seedStamp(5000), amount: 18500, partnerShare: 14800, authorityShare: 3700 }],
  activity: [
    { id: 'ACT-01', time: seedStamp(35), text: 'Ada Okafor sent a message about her Friday pickup window.', customerId: 'CUS-071-ADA' },
    { id: 'ACT-02', time: seedStamp(40), text: 'New pickup request PU-710001 from Ada Okafor · ₦1,500 reserved.', customerId: 'CUS-071-ADA' },
    { id: 'ACT-03', time: seedStamp(55), text: 'New pickup request PU-180002 from Tunde Bakare · ₦1,450 reserved.', customerId: 'CUS-018-TUNDE' },
    { id: 'ACT-04', time: seedStamp(90), text: 'Ngozi Umeh requested a new 240 L bin.', customerId: 'CUS-065-NGOZI' },
    { id: 'ACT-05', time: seedStamp(600), text: 'PU-088401 scheduled for Ibrahim Suleiman with Crew Alpha.', customerId: 'CUS-088-IBRAHIM' },
    { id: 'ACT-06', time: seedStamp(790), text: 'Ibrahim Suleiman reported a missed collection.', customerId: 'CUS-088-IBRAHIM' },
    { id: 'ACT-07', time: seedStamp(2790), text: 'PU-200101 completed for Folasade Adigun · earnings captured.', customerId: 'CUS-200-FOLA' },
    { id: 'ACT-08', time: seedStamp(4190), text: 'PU-210301 completed for Kunle Oyelaran · earnings captured.', customerId: 'CUS-210-KUNLE' },
  ],
  lawmaThread: [{ id: 'LAWMA-01', role: 'assistant', text: 'Reminder: weekly remittance is due by Friday 5 pm.', time: seedStamp(1400) }],
  earningsUncaptured: 2950,
  binDeliveryUntil: 0,
  lawmaAckAt: 0,
  profile: { name: 'Mainland Clean Services', areas: 'Ikeja · Yaba · Ajah · Lekki', contact: 'ops@mainlandclean.ng · 0700 000 1500', notifyRequests: true, notifyMessages: true, notifyRemittance: true },
});

const key = 'smartwaste360-partner-demo-v1';
const PARTNER_SHARE = 0.8;
const stamp = () => new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
const id = (prefix: string) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
const limit = <T,>(items: T[], item: T, max = 30) => [item, ...items].slice(0, max);

type Store = {
  model: Model; ready: boolean; customerById: (id: string) => Customer | undefined;
  acceptRequest: (pickupId: string, crewId: string, window: string) => void; declineRequest: (pickupId: string, reason: string) => void;
  approveBinRequest: (binRequestId: string) => void; declineBinRequest: (binRequestId: string, reason: string) => void;
  completeStop: (stopId: string) => void; remitToLawma: () => Settlement;
  sendMessageToCustomer: (customerId: string, text: string) => void; sendMessageToLawma: (text: string) => void;
  resolveIssue: (customerId: string, issueId: string, reply: string) => void; updateProfile: (patch: Partial<PartnerProfile>) => void; reset: () => void;
};

const StoreContext = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<Model>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => { AsyncStorage.getItem(key).then(raw => { if (raw) { try { setModel({ ...seed(), ...(JSON.parse(raw) as Model) }); } catch { /* keep fresh demo */ } } }).catch(() => undefined).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(key, JSON.stringify(model)).catch(() => undefined); }, [model, ready]);
  useEffect(() => {
    if (!ready || !model.binDeliveryUntil) return;
    const deadline = model.binDeliveryUntil;
    const timer = setTimeout(() => setModel(s => s.binDeliveryUntil !== deadline ? s : ({ ...s, binDeliveryUntil: 0,
      customers: s.customers.map(c => c.bins.some(b => b.state === 'Out for delivery') ? { ...c, bins: c.bins.map(b => b.state === 'Out for delivery' ? { ...b, state: 'Active' as const } : b), notices: limit(c.notices, 'Your new smart bin was delivered and is now active.') } : c),
      activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: 'Approved bin delivery completed · device now active.' }) })), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [ready, model.binDeliveryUntil]);
  useEffect(() => {
    if (!ready || !model.lawmaAckAt) return;
    const deadline = model.lawmaAckAt;
    const timer = setTimeout(() => setModel(s => s.lawmaAckAt !== deadline ? s : ({ ...s, lawmaAckAt: 0, lawmaThread: [...s.lawmaThread, { id: id('LMSG'), role: 'assistant' as const, text: 'Received. The revenue team will confirm your settlement.', time: stamp() }].slice(-50) })), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [ready, model.lawmaAckAt]);
  const store = useMemo<Store>(() => ({
    model, ready,
    customerById(cid) { return model.customers.find(c => c.id === cid); },
    acceptRequest(pickupId, crewId, window) {
      setModel(s => {
        let customerId = ''; let amount = 0;
        const customers = s.customers.map(c => {
          const idx = c.pickups.findIndex(p => p.id === pickupId);
          if (idx === -1 || c.pickups[idx].status !== 'Requested') return c;
          customerId = c.id; amount = c.pickups[idx].amount;
          return { ...c, pickups: c.pickups.map((p, i) => i === idx ? { ...p, status: 'Scheduled' as const, window, crew: crewId } : p), reserved: Math.max(0, c.reserved - amount),
            entries: limit(c.entries, { id: id('PAY'), title: `Partner credited ${money(amount)} · ${pickupId}`, amount: 0, time: stamp(), kind: 'paid' as const }),
            notices: limit(c.notices, `${pickupId} accepted and scheduled for ${window}. The reserved amount was marked paid to the partner.`) };
        });
        if (!customerId) return s;
        const crew = s.crews.find(c => c.id === crewId);
        const customer = customers.find(c => c.id === customerId);
        return { ...s, customers,
          routeStops: customer ? [...s.routeStops, { id: id('STOP'), crewId, customerId, pickupId, address: `${customer.address}, ${customer.area}`, window, done: false }] : s.routeStops,
          activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `${pickupId} accepted for ${customer?.name ?? 'customer'} · ${crew?.name ?? crewId} · ${window}.`, customerId }) };
      });
    },
    declineRequest(pickupId, reason) {
      setModel(s => {
        let customerId = '';
        const customers = s.customers.map(c => {
          const idx = c.pickups.findIndex(p => p.id === pickupId);
          if (idx === -1 || c.pickups[idx].status !== 'Requested') return c;
          customerId = c.id;
          const amount = c.pickups[idx].amount;
          return { ...c, pickups: c.pickups.map((p, i) => i === idx ? { ...p, status: 'Declined' as const } : p), reserved: Math.max(0, c.reserved - amount), balance: c.balance + amount,
            entries: limit(c.entries, { id: id('REL'), title: `Reservation released · ${pickupId}`, amount, time: stamp(), kind: 'released' as const }),
            notices: limit(c.notices, `Pickup ${pickupId} was declined: ${reason}. Your reservation was returned.`) };
        });
        if (!customerId) return s;
        const customer = customers.find(c => c.id === customerId);
        return { ...s, customers, activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `${pickupId} declined for ${customer?.name ?? 'customer'}: ${reason}.`, customerId }) };
      });
    },
    approveBinRequest(binRequestId) {
      setModel(s => {
        const req = s.binRequests.find(b => b.id === binRequestId);
        if (!req || req.status !== 'Pending') return s;
        const customers = s.customers.map(c => c.id === req.customerId ? { ...c, bins: [...c.bins, { id: id('BIN'), size: req.size, state: 'Out for delivery' as const }], notices: limit(c.notices, `Your ${req.kind === 'new' ? 'new' : 'additional'} ${req.size} L bin is approved and delivery is scheduled.`) } : c);
        const customer = customers.find(c => c.id === req.customerId);
        return { ...s, customers, binDeliveryUntil: Date.now() + 3000,
          binRequests: s.binRequests.map(b => b.id === binRequestId ? { ...b, status: 'Approved' as const } : b),
          activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `Bin request approved for ${customer?.name ?? 'customer'} · delivery scheduled.`, customerId: req.customerId }) };
      });
    },
    declineBinRequest(binRequestId, reason) {
      setModel(s => {
        const req = s.binRequests.find(b => b.id === binRequestId);
        if (!req || req.status !== 'Pending') return s;
        return { ...s,
          binRequests: s.binRequests.map(b => b.id === binRequestId ? { ...b, status: 'Declined' as const } : b),
          customers: s.customers.map(c => c.id === req.customerId ? { ...c, notices: limit(c.notices, `Bin request declined: ${reason}.`) } : c),
          activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `Bin request declined: ${reason}.`, customerId: req.customerId }) };
      });
    },
    completeStop(stopId) {
      setModel(s => {
        const stop = s.routeStops.find(r => r.id === stopId);
        if (!stop || stop.done) return s;
        let captured = 0;
        const customers = s.customers.map(c => {
          if (c.id !== stop.customerId) return c;
          const idx = c.pickups.findIndex(p => p.id === stop.pickupId);
          if (idx === -1) return c;
          captured = c.pickups[idx].amount;
          return { ...c, pickups: c.pickups.map((p, i) => i === idx ? { ...p, status: 'Completed' as const, evidence: 'CREW-EVIDENCE-01 · collection evidence recorded' } : p),
            entries: limit(c.entries, { id: id('ENT'), title: `Pickup completed · ${stop.pickupId}`, amount: 0, time: stamp(), kind: 'paid' as const }),
            notices: limit(c.notices, `Pickup ${stop.pickupId} completed by ${s.crews.find(cr => cr.id === stop.crewId)?.name ?? 'crew'}.`) };
        });
        const customer = customers.find(c => c.id === stop.customerId);
        return { ...s, customers, routeStops: s.routeStops.map(r => r.id === stopId ? { ...r, done: true } : r), earningsUncaptured: s.earningsUncaptured + captured,
          activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `Stop completed for ${customer?.name ?? 'customer'} · ${money(captured)} captured to earnings.`, customerId: stop.customerId }) };
      });
    },
    remitToLawma() {
      const amount = model.earningsUncaptured;
      const authorityShare = Math.round(amount * (1 - PARTNER_SHARE));
      const settlement: Settlement = { ref: id('SET'), date: stamp(), amount, partnerShare: amount - authorityShare, authorityShare };
      setModel(s => ({ ...s, earningsUncaptured: 0, settlements: [settlement, ...s.settlements], activity: limit(s.activity, { id: id('ACT'), time: stamp(), text: `Remitted ${money(amount)} to LAWMA · ref ${settlement.ref}.` }) }));
      return settlement;
    },
    sendMessageToCustomer(customerId, text) { setModel(s => ({ ...s, customers: s.customers.map(c => c.id === customerId ? { ...c, supportMessages: [...c.supportMessages, { id: id('MSG'), role: 'assistant' as const, text, time: stamp() }].slice(-50) } : c) })); },
    sendMessageToLawma(text) { setModel(s => ({ ...s, lawmaAckAt: Date.now() + 2000, lawmaThread: [...s.lawmaThread, { id: id('LMSG'), role: 'customer' as const, text, time: stamp() }].slice(-50) })); },
    resolveIssue(customerId, issueId, reply) { setModel(s => ({ ...s, customers: s.customers.map(c => c.id === customerId ? { ...c, status: 'Active' as const, issues: c.issues.map(i => i.id === issueId ? { ...i, status: 'Resolved' as const, reply } : i), notices: limit(c.notices, `${issueId} resolved: ${reply}`) } : c) })); },
    updateProfile(patch) { setModel(s => ({ ...s, profile: { ...s.profile, ...patch } })); },
    reset() { setModel(seed()); AsyncStorage.removeItem(key).catch(() => undefined); },
  }), [model, ready]);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error('StoreProvider missing'); return value; }
export const money = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;
