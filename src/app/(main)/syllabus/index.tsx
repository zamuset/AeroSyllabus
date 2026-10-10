import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { SimulatedPressable } from '../../../components/LoadGate';
import { Card, ImageSlot, Pill, Screen, ScreenHeader } from '../../../components/ui';
import { program, stages } from '../../../data/catalog';
import { audienceLabel, sessionStatusLabel, sessionTypeLabel, toneForSession } from '../../../data/labels';
import { sessionsFor, statusOf } from '../../../data/progress';
import { useApp } from '../../../state/AppContext';
import { colors } from '../../../theme/theme';

export default function SyllabusScreen() {
  const { user, snapshot } = useApp();
  if (!user) {
    return null;
  }
  const route = sessionsFor(user.rol);
  const subtitle =
    user.rol === 'instructor'
      ? 'Ves las cuatro etapas y las dos rutas.'
      : `Solo aparecen las sesiones de tu ruta y las compartidas.`;

  return (
    <Screen>
      <ScreenHeader kicker={program.duracion} title="Syllabus" subtitle={subtitle} />
      <Text style={styles.note}>{program.nota}</Text>
      {stages.map((stage) => {
        const stageSessions = route.filter((session) => session.stageId === stage.id);
        if (stageSessions.length === 0) {
          return null;
        }
        return (
          <Card key={stage.id}>
            <ImageSlot imageKey={stage.imageKey} label={stage.titulo} aspectRatio={2.4} />
            <Text style={styles.kicker}>
              Etapa {stage.orden} · {stage.mes}
            </Text>
            <Text style={styles.title}>{stage.titulo}</Text>
            <Text style={styles.body}>{stage.resumen}</Text>
            <View style={styles.list}>
              {stageSessions.map((session) => {
                const ownerId = user.rol === 'instructor' ? undefined : user.id;
                const status = ownerId ? statusOf(snapshot.sessionProgress, ownerId, session.id) : undefined;
                return (
                  <SimulatedPressable
                    key={session.id}
                    accessibilityRole="button"
                    onPress={() => router.push(`/syllabus/${session.id}`)}
                    style={styles.session}
                  >
                    <View style={styles.sessionTop}>
                      <Text style={styles.week}>Semana {session.semana}</Text>
                      <View style={styles.pills}>
                        <Pill label={sessionTypeLabel[session.tipo]} />
                        {status ? <Pill label={sessionStatusLabel[status]} tone={toneForSession(status)} /> : null}
                      </View>
                    </View>
                    <Text style={styles.sessionTitle}>{session.titulo}</Text>
                    <Text style={styles.audience}>{audienceLabel[session.audiencia]}</Text>
                  </SimulatedPressable>
                );
              })}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  kicker: { color: colors.amber, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 24, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  list: { gap: 8, marginTop: 4 },
  session: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 4 },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  pills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  week: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  sessionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  audience: { color: colors.muted, fontSize: 13 },
});
