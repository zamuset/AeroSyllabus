import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';

import { Card, ImageSlot, Pill, Screen, ScreenHeader } from '../../../components/ui';
import { program, resources } from '../../../data/catalog';
import { readingStatusLabel, resourceKindLabel } from '../../../data/labels';
import { ResourceKind } from '../../../data/types';
import { useApp } from '../../../state/AppContext';
import { colors, tabletMinWidth } from '../../../theme/theme';

const filters: Array<{ id: 'todos' | ResourceKind; label: string }> = [
  { id: 'todos', label: 'Todo' },
  { id: 'pdf', label: 'Manuales' },
  { id: 'video', label: 'Video' },
  { id: 'diagrama', label: 'Diagramas' },
];

export default function BibliotecaScreen() {
  const { user, snapshot } = useApp();
  const { width } = useWindowDimensions();
  const wide = width >= tabletMinWidth;
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('todos');
  if (!user) {
    return null;
  }
  const visible = resources.filter((resource) => filter === 'todos' || resource.kind === filter);

  return (
    <Screen>
      <ScreenHeader
        kicker="Biblioteca"
        title="Material del programa"
        subtitle="Los PDF viajan dentro de la app y se pueden abrir sin red. Video y diagramas están listos para cuando agregues los archivos."
      />
      <Text style={styles.note}>{program.nota}</Text>
      <View style={styles.filters}>
        {filters.map((item) => {
          const active = item.id === filter;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => setFilter(item.id)}
              style={[styles.filter, active && styles.filterActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.grid}>
        {visible.map((resource) => {
          const reading = snapshot.readingProgress.find((row) => row.userId === user.id && row.resourceId === resource.id);
          return (
            <Pressable
              key={resource.id}
              accessibilityRole="button"
              onPress={() => router.push(`/biblioteca/${resource.id}`)}
              style={{ width: wide ? '48.5%' : '100%' }}
            >
              <Card>
                {resource.imageKey ? <ImageSlot imageKey={resource.imageKey} label={resource.titulo} /> : null}
                <Text style={styles.kicker}>{resource.codigo ?? resourceKindLabel[resource.kind]}</Text>
                <Text style={styles.title}>{resource.titulo}</Text>
                <Text style={styles.body}>{resource.descripcion}</Text>
                <Pill label={readingStatusLabel[reading?.status ?? 'no_leido']} tone={reading?.status === 'leido' ? 'ok' : 'neutral'} />
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 8 },
  filterActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  filterTextActive: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kicker: { color: colors.amber, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
});
