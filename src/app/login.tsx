import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SimulatedPressable } from '../components/LoadGate';
import { SoftEnter } from '../components/motion';
import { ImageSlot } from '../components/ui';
import { program, users } from '../data/catalog';
import { useApp } from '../state/AppContext';
import { colors, tabletMinWidth } from '../theme/theme';
import { displayName } from '../lib/text';

export default function LoginScreen() {
  const { ready, user, error, login } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= tabletMinWidth;
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (ready && user) {
    return <Redirect href="/inicio" />;
  }

  async function signIn(nextEmail: string, nextPassword: string) {
    setBusy(true);
    setMessage(null);
    const result = await login(nextEmail, nextPassword);
    setBusy(false);
    if (result) {
      setMessage(result);
      return;
    }
    router.replace('/inicio');
  }

  const hero = (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <ImageSlot imageKey="marca/logo.png" label="Logotipo" height={wide ? 140 : 168} fit="contain" />
      <Text style={styles.kicker}>Área de adiestramiento</Text>
      <Text style={styles.brand}>AeroSyllabus</Text>
      <Text style={styles.lead}>
        {program.nombre}. {program.duracion}. Consulta el syllabus, los temarios y el avance de cada piloto.
      </Text>
      <Text style={styles.note}>{program.nota}</Text>
    </View>
  );

  const form = (
    <View style={[styles.form, wide && styles.formWide]}>
      <Text style={styles.formTitle}>Entrar al programa</Text>
      <Text style={styles.formLead}>Este acceso es simulado. No hay servidor: la sesión queda en el dispositivo.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Correo</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="capitan@aerosyllabus.dev"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="demo123"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <SimulatedPressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => signIn(email, password)}
        style={[styles.primary, busy && styles.disabled]}
      >
        <Text style={styles.primaryText}>{busy ? 'Entrando…' : 'Entrar'}</Text>
      </SimulatedPressable>
      <Text style={styles.demoTitle}>Cuentas de demostración</Text>
      <View style={styles.demoList}>
        {users.map((account) => (
          <SimulatedPressable
            key={account.id}
            accessibilityRole="button"
            disabled={busy}
            onPress={() => signIn(account.email, account.password)}
            style={styles.demo}
          >
            <Text style={styles.demoName}>{displayName(account.tratamiento, account.nombre)}</Text>
            <Text style={styles.demoMeta}>
              {account.rolLabel} · {account.email}
            </Text>
          </SimulatedPressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <SoftEnter>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.split, wide && styles.splitWide, { paddingBottom: Math.max(insets.bottom, 24) }]}
          keyboardShouldPersistTaps="handled"
        >
          {hero}
          {form}
        </ScrollView>
      </SoftEnter>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  fill: { flex: 1 },
  split: { flexGrow: 1 },
  splitWide: { flexDirection: 'row', alignItems: 'stretch' },
  hero: { backgroundColor: colors.navy, padding: 24, gap: 14 },
  heroWide: { width: '42%' },
  form: { padding: 24, gap: 16, flexGrow: 1 },
  formWide: { width: '58%' },
  kicker: { color: colors.gold, fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  brand: { color: colors.white, fontSize: 36, fontWeight: '700' },
  lead: { color: colors.mutedOnNavy, fontSize: 16, lineHeight: 22 },
  note: { color: '#8EA0B0', fontSize: 13, lineHeight: 18 },
  formTitle: { color: colors.ink, fontSize: 28, fontWeight: '700' },
  formLead: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  primary: { backgroundColor: colors.navy, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
  error: { color: colors.red, fontSize: 14 },
  demoTitle: { marginTop: 8, color: colors.ink, fontSize: 15, fontWeight: '700' },
  demoList: { gap: 8 },
  demo: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 2 },
  demoName: { color: colors.ink, fontWeight: '700', fontSize: 15 },
  demoMeta: { color: colors.muted, fontSize: 13 },
});
