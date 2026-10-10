import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SimulatedPressable } from './LoadGate';
import { ImageSlot } from './ui';
import { useApp } from '../state/AppContext';
import { colors, tabletMinWidth } from '../theme/theme';
import { displayName } from '../lib/text';

const NAV = [
  { href: '/inicio', label: 'Inicio', match: 'exact' },
  { href: '/syllabus', label: 'Syllabus', match: 'prefix' },
  { href: '/biblioteca', label: 'Biblioteca', match: 'prefix' },
  { href: '/evaluaciones', label: 'Evaluaciones', match: 'prefix' },
  { href: '/liberacion', label: 'Liberación', match: 'prefix' },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= tabletMinWidth;
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {wide ? (
          <View style={[styles.sidebar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.brandBlock}>
              <ImageSlot imageKey="marca/logo.png" label="Logotipo" aspectRatio={16 / 9} fit="contain" />
              <Text style={styles.brandKicker}>Programa de vuelo</Text>
              <Text style={styles.brand}>AeroSyllabus</Text>
            </View>
            <View style={styles.nav}>
              {NAV.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </View>
            <ConnectivityBlock />
            {user ? (
              <View style={styles.userBlock}>
                <Text style={styles.userName}>{displayName(user.tratamiento, user.nombre)}</Text>
                <Text style={styles.userRole}>{user.rolLabel}</Text>
                <SimulatedPressable accessibilityRole="button" onPress={() => logout()} style={styles.logoutButton}>
                  <Text style={styles.logout}>Cerrar sesión</Text>
                </SimulatedPressable>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={[styles.content, { paddingBottom: insets.bottom }]}>
          {wide ? null : (
            <View style={styles.phoneBar}>
              <View style={styles.phoneTop}>
                <View>
                  <Text style={styles.phoneBrand}>AeroSyllabus</Text>
                  {user ? (
                    <Text style={styles.phoneUser}>
                      {displayName(user.tratamiento, user.nombre)} · {user.rolLabel}
                    </Text>
                  ) : null}
                </View>
                <SimulatedPressable accessibilityRole="button" onPress={() => logout()} style={styles.logoutButton}>
                  <Text style={styles.logout}>Salir</Text>
                </SimulatedPressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phoneNav}>
                {NAV.map((item) => (
                  <NavItem key={item.href} item={item} compact />
                ))}
              </ScrollView>
              <ConnectivityBlock compact />
            </View>
          )}
          <View style={styles.slot}>{children}</View>
        </View>
      </View>
    </View>
  );
}

function NavItem({
  item,
  compact = false,
}: {
  item: (typeof NAV)[number];
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = item.match === 'exact' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <SimulatedPressable
      accessibilityRole="button"
      onPress={() => router.push(item.href)}
      style={[styles.navItem, compact && styles.navItemCompact, active && styles.navItemActive]}
    >
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
    </SimulatedPressable>
  );
}

function ConnectivityBlock({ compact = false }: { compact?: boolean }) {
  const { connectivity, snapshot, syncNote, setConnectivity } = useApp();
  const online = connectivity === 'online';
  return (
    <View style={[styles.sync, compact && styles.syncCompact]}>
      <View style={styles.syncRow}>
        <View style={[styles.dot, { backgroundColor: online ? '#7DCEA0' : colors.gold }]} />
        <Text style={styles.syncTitle}>{online ? 'En línea (simulado)' : 'Sin conexión'}</Text>
      </View>
      <Text style={styles.syncBody}>
        {snapshot.pendingCount > 0
          ? `${snapshot.pendingCount} cambios pendientes de envío`
          : 'El progreso vive en este dispositivo'}
      </Text>
      {syncNote ? <Text style={styles.syncNote}>{syncNote}</Text> : null}
      <SimulatedPressable
        accessibilityRole="button"
        onPress={() => setConnectivity(online ? 'offline' : 'online')}
        style={styles.syncButton}
      >
        <Text style={styles.syncButtonText}>{online ? 'Simular corte de red' : 'Simular reconexión'}</Text>
      </SimulatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  body: { flex: 1, flexDirection: 'row', backgroundColor: colors.canvas },
  sidebar: { width: 280, backgroundColor: colors.navy, padding: 20, gap: 18 },
  brandBlock: { gap: 4 },
  brandKicker: { color: colors.gold, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  brand: { color: colors.white, fontSize: 26, fontWeight: '700' },
  nav: { gap: 6 },
  navItem: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  navItemCompact: { backgroundColor: colors.navyRaised, marginRight: 8 },
  navItemActive: { backgroundColor: colors.navyRaised },
  navLabel: { color: colors.mutedOnNavy, fontSize: 16, fontWeight: '600' },
  navLabelActive: { color: colors.white },
  content: { flex: 1 },
  slot: { flex: 1 },
  phoneBar: { backgroundColor: colors.navy, paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  phoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  phoneBrand: { color: colors.white, fontSize: 18, fontWeight: '700' },
  phoneUser: { color: colors.mutedOnNavy, fontSize: 13, marginTop: 2 },
  phoneNav: { paddingVertical: 2 },
  userBlock: { gap: 2, borderTopWidth: 1, borderTopColor: colors.navyRaised, paddingTop: 14, paddingBottom: 8 },
  userName: { color: colors.white, fontSize: 15, fontWeight: '700' },
  userRole: { color: colors.mutedOnNavy, fontSize: 13 },
  logoutButton: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 12, paddingRight: 16 },
  logout: { color: colors.gold, fontSize: 14, fontWeight: '700' },
  sync: { gap: 6, marginTop: 'auto', backgroundColor: colors.navyRaised, borderRadius: 14, padding: 12 },
  syncCompact: { marginTop: 0 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  syncTitle: { color: colors.white, fontSize: 13, fontWeight: '700' },
  syncBody: { color: colors.mutedOnNavy, fontSize: 12, lineHeight: 16 },
  syncNote: { color: colors.gold, fontSize: 12, lineHeight: 16 },
  syncButton: { marginTop: 4 },
  syncButtonText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
