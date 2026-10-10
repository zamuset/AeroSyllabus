import { Stack } from 'expo-router';

import { LoadProvider } from '../components/LoadGate';
import { AppProvider } from '../state/AppContext';
import { colors } from '../theme/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <LoadProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
      </LoadProvider>
    </AppProvider>
  );
}
