import React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Text } from './text';
import { C } from './ui';
import { P } from './ui-partner';
import { Icon, IconName } from './icons';
import { SheetHost } from './sheet-overlay';
import { whiteLogo } from './splash-assets';
import { useStore } from './store';

const items: { route: string; label: string; icon: IconName }[] = [
  { route: '/overview', label: 'Overview', icon: 'home' },
  { route: '/requests', label: 'Requests', icon: 'plus' },
  { route: '/customers', label: 'Customers', icon: 'you' },
  { route: '/operations', label: 'Operations', icon: 'bins' },
  { route: '/finance', label: 'Finance', icon: 'wallet' },
  { route: '/messages', label: 'Messages', icon: 'help' },
  { route: '/live-link', label: 'Live Link', icon: 'eye' },
  { route: '/settings', label: 'Settings', icon: 'activity' },
];

function NavItem({ route, label, icon, active, wide }: { route: string; label: string; icon: IconName; active: boolean; wide: boolean }) {
  const router = useRouter();
  return <Pressable accessibilityRole="link" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={() => router.push(route as never)}
    style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: active ? P.lime : 'transparent', opacity: pressed ? 0.75 : 1 }, !wide && { minHeight: 40, paddingVertical: 8 }]}>
    <Icon name={icon} size={18} color={active ? P.limeInk : P.sidebarMuted} />
    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? P.limeInk : P.sidebarMuted }}>{label}</Text>
  </Pressable>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const pathname = usePathname();
  const { model } = useStore();
  const content = <SheetHost><View style={{ flex: 1, backgroundColor: C.bg }}>{children}</View></SheetHost>;
  if (wide) {
    return <SafeAreaView style={{ flex: 1, flexDirection: 'row', backgroundColor: P.sidebar }} edges={['top', 'left', 'right', 'bottom']}>
      <View accessibilityRole="menu" accessibilityLabel="Primary navigation" style={{ width: 252, backgroundColor: P.sidebar, paddingHorizontal: 16, paddingVertical: 22, justifyContent: 'space-between' }}>
        <View>
          <View accessibilityLabel="SmartWaste360 Partner console" style={{ paddingHorizontal: 14, marginBottom: 6 }}>
            <SvgXml xml={whiteLogo} width={170} height={48} />
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: P.sidebarMuted, textTransform: 'uppercase', marginTop: 8 }}>Partner console</Text>
          </View>
          <View style={{ marginTop: 14, gap: 2 }}>
            {items.map(item => <NavItem key={item.route} {...item} active={pathname === item.route} wide />)}
          </View>
        </View>
        <View style={{ backgroundColor: '#1C4A39', borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>{model.profile.name}</Text>
          <Text style={{ fontSize: 11, lineHeight: 16, color: P.sidebarMuted, marginTop: 3 }}>{model.profile.areas}</Text>
        </View>
      </View>
      {content}
    </SafeAreaView>;
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: P.sidebar }} edges={['top', 'left', 'right']}>
    <View style={{ backgroundColor: P.sidebar, paddingTop: 14, paddingBottom: 10 }}>
      <View accessibilityLabel="SmartWaste360 Partner console" style={{ paddingHorizontal: 20 }}><SvgXml xml={whiteLogo} width={138} height={39} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 4, marginTop: 8 }} accessibilityRole="menu" accessibilityLabel="Primary navigation">
        {items.map(item => <NavItem key={item.route} {...item} active={pathname === item.route} wide={false} />)}
      </ScrollView>
    </View>
    {content}
  </SafeAreaView>;
}
