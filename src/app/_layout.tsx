import { Stack } from 'expo-router';

import { AppProvider } from '../state/AppContext';
import { colors } from '../theme/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
    </AppProvider>
  );
}
