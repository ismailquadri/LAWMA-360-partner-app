import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../store';
import { Shell } from '../shell';
export default function Layout() {
  const [loaded, error] = useFonts({ DM_Regular: require('../../assets/fonts/DMSans_400Regular.ttf'), DM_Medium: require('../../assets/fonts/DMSans_500Medium.ttf'), DM_Semibold: require('../../assets/fonts/DMSans_600SemiBold.ttf') });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#FAF9F6' }} />;
  return <SafeAreaProvider><StoreProvider><StatusBar style="light" /><Shell><Slot /></Shell></StoreProvider></SafeAreaProvider>;
}
