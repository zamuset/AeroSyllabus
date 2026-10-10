import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../../components/AppShell';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/theme';

export default function MainLayout() {
  const { ready, user, error } = useApp();
  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.boot}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/login" />;
  }
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.gold, padding: 24, textAlign: 'center' },
});
