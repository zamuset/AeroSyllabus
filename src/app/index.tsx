import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useApp } from '../state/AppContext';
import { colors } from '../theme/theme';

export default function Index() {
  const { ready, user, error } = useApp();
  if (!ready) {
    return (
      <View style={styles.boot}>
        <Text style={styles.brand}>AeroSyllabus</Text>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.boot}>
        <Text style={styles.brand}>AeroSyllabus</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/login" />;
  }
  return <Redirect href="/inicio" />;
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand: { color: colors.white, fontSize: 28, fontWeight: '700' },
  error: { color: colors.gold, fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
});
