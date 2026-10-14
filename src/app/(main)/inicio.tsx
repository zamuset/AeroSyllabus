import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { SoftPressable } from '../../components/motion';
import { Card, Pill, ProgressBar, Screen, ScreenHeader } from '../../components/ui';
import { findStage, program, trainees } from '../../data/catalog';
import { releaseLabel, sessionStatusLabel, toneForRelease, toneForSession } from '../../data/labels';
import { completedCount, nextSession, sessionsFor, statusOf } from '../../data/progress';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/theme';
import { displayName } from '../../lib/text';

export default function InicioScreen() {
  const { user, snapshot } = useApp();
  if (!user) {
    return null;
  }

  if (user.rol === 'instructor') {
    return (
      <Screen>
        <ScreenHeader
          kicker={program.duracion}
          title="Panel del instructor"
          subtitle="Dos pilotos de ejemplo. Las evaluaciones y la liberación se guardan en este dispositivo."
        />
        <View style={styles.grid}>
          {trainees.map((trainee) => {
            const counts = completedCount(trainee.rol, snapshot.sessionProgress, trainee.id);
            const release = snapshot.releases.find((item) => item.userId === trainee.id);
            const upcoming = nextSession(trainee.rol, snapshot.sessionProgress, trainee.id);
            return (
              <Card key={trainee.id} style={styles.gridCard}>
                <Text style={styles.cardKicker}>{trainee.rolLabel}</Text>
                <Text style={styles.cardTitle}>{displayName(trainee.tratamiento, trainee.nombre)}</Text>
                <Pill label={releaseLabel[release?.status ?? 'en_adiestramiento']} tone={toneForRelease(release?.status ?? 'en_adiestramiento')} />
                <Text style={styles.meta}>
                  Ruta: {counts.done} de {counts.total} sesiones completadas
                </Text>
                <ProgressBar value={counts.total === 0 ? 0 : counts.done / counts.total} />
                <Text style={styles.meta}>Siguiente: {upcoming ? upcoming.titulo : 'Ruta completa'}</Text>
                <SoftPressable
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/evaluaciones/nueva', params: { traineeId: trainee.id } })}
                >
                  <Text style={styles.link}>Registrar evaluación</Text>
                </SoftPressable>
              </Card>
            );
          })}
        </View>
      </Screen>
    );
  }

  const counts = completedCount(user.rol, snapshot.sessionProgress, user.id);
  const upcoming = nextSession(user.rol, snapshot.sessionProgress, user.id);
  const stage = upcoming ? findStage(upcoming.stageId) : undefined;
  const release = snapshot.releases.find((item) => item.userId === user.id);
  const ratio = counts.total === 0 ? 0 : counts.done / counts.total;

  return (
    <Screen>
      <ScreenHeader
        kicker={program.nombre}
        title={`Hola, ${displayName(user.tratamiento, user.nombre)}`}
        subtitle={`Ruta de ${user.rolLabel.toLowerCase()}. ${counts.done} de ${counts.total} sesiones completadas.`}
      />
      <Card>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Avance de la ruta</Text>
          <Pill label={releaseLabel[release?.status ?? 'en_adiestramiento']} tone={toneForRelease(release?.status ?? 'en_adiestramiento')} />
        </View>
        <ProgressBar value={ratio} />
        <Text style={styles.meta}>{program.nota}</Text>
      </Card>
      {upcoming ? (
        <Card>
          <Text style={styles.cardKicker}>{stage ? `${stage.mes} · ${stage.titulo}` : 'Siguiente sesión'}</Text>
          <Text style={styles.cardTitle}>{upcoming.titulo}</Text>
          <Text style={styles.body}>{upcoming.resumen}</Text>
          <View style={styles.row}>
            <Pill label={`Semana ${upcoming.semana}`} />
            <Pill
              label={sessionStatusLabel[statusOf(snapshot.sessionProgress, user.id, upcoming.id)]}
              tone={toneForSession(statusOf(snapshot.sessionProgress, user.id, upcoming.id))}
            />
          </View>
          <SoftPressable accessibilityRole="button" onPress={() => router.push(`/syllabus/${upcoming.id}`)}>
            <Text style={styles.link}>Abrir sesión</Text>
          </SoftPressable>
        </Card>
      ) : (
        <Card>
          <Text style={styles.cardTitle}>Ruta completa</Text>
          <Text style={styles.body}>Las sesiones de tu ruta están marcadas como completadas en este dispositivo.</Text>
        </Card>
      )}
      <Text style={styles.section}>Tu ruta</Text>
      {sessionsFor(user.rol).map((session) => {
        const status = statusOf(snapshot.sessionProgress, user.id, session.id);
        const sessionStage = findStage(session.stageId);
        return (
          <SoftPressable key={session.id} accessibilityRole="button" onPress={() => router.push(`/syllabus/${session.id}`)}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.meta}>{sessionStage?.mes} · Semana {session.semana}</Text>
                <Pill label={sessionStatusLabel[status]} tone={toneForSession(status)} />
              </View>
              <Text style={styles.cardTitle}>{session.titulo}</Text>
            </Card>
          </SoftPressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { flexGrow: 1, flexBasis: 280 },
  cardKicker: { color: colors.amber, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  meta: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  link: { color: colors.blue, fontSize: 15, fontWeight: '700' },
  section: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 8 },
});
