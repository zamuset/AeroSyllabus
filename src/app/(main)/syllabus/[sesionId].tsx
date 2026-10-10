import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SimulatedPressable } from '../../../components/LoadGate';
import { Button, Card, Pill, Screen, ScreenHeader } from '../../../components/ui';
import { findResource, findSession, findStage, trainees } from '../../../data/catalog';
import {
  audienceLabel,
  sessionStatusLabel,
  sessionTypeLabel,
  syncLabel,
  toneForSession,
  toneForSync,
} from '../../../data/labels';
import { sessionsFor, statusOf } from '../../../data/progress';
import { useApp } from '../../../state/AppContext';
import { colors } from '../../../theme/theme';
import { displayName, param } from '../../../lib/text';

export default function SesionScreen() {
  const { sesionId } = useLocalSearchParams<{ sesionId?: string | string[] }>();
  const id = param(sesionId);
  const session = id ? findSession(id) : undefined;
  const { user, snapshot, setSessionStatus } = useApp();

  if (!user || !session) {
    return (
      <Screen>
        <ScreenHeader title="Sesión no encontrada" back />
      </Screen>
    );
  }

  const visible = sessionsFor(user.rol).some((item) => item.id === session.id);
  if (!visible) {
    return (
      <Screen>
        <ScreenHeader title="Sesión fuera de tu ruta" subtitle="Esta sesión pertenece a la otra ruta del programa." back />
      </Screen>
    );
  }

  const stage = findStage(session.stageId);
  const progress = snapshot.sessionProgress.find((row) => row.userId === user.id && row.sessionId === session.id);
  const status = progress?.status ?? 'pendiente';
  const linked = [
    ...(session.recursoId ? [session.recursoId] : []),
    ...(session.recursoIds ?? []),
  ]
    .map((resourceId) => findResource(resourceId))
    .filter((resource) => resource !== undefined);

  return (
    <Screen>
      <ScreenHeader
        kicker={stage ? `${stage.mes} · Semana ${session.semana}` : `Semana ${session.semana}`}
        title={session.titulo}
        subtitle={session.resumen}
        back
      />
      <View style={styles.pills}>
        <Pill label={sessionTypeLabel[session.tipo]} />
        <Pill label={audienceLabel[session.audiencia]} />
        {user.rol !== 'instructor' ? <Pill label={sessionStatusLabel[status]} tone={toneForSession(status)} /> : null}
        {progress ? <Pill label={syncLabel[progress.syncStatus]} tone={toneForSync(progress.syncStatus)} /> : null}
      </View>

      {session.tipo === 'lectura' && user.rol !== 'instructor' ? (
        <Card>
          <Text style={styles.section}>Tu avance</Text>
          <Text style={styles.body}>Marca la lectura cuando termines el temario. El cambio se guarda en el dispositivo.</Text>
          <View style={styles.actions}>
            <Button label="En progreso" variant="secondary" onPress={() => setSessionStatus(session.id, 'en_progreso')} />
            <Button label="Marcar como estudiada" onPress={() => setSessionStatus(session.id, 'completada')} />
          </View>
        </Card>
      ) : null}

      {session.tipo === 'vuelo' ? (
        <Card>
          <Text style={styles.section}>Bitácora</Text>
          <Text style={styles.body}>Semana {session.semana} del programa · Vuelo asesorado</Text>
          <Text style={styles.body}>Instructor asignado: Instr. Helena Ruiz</Text>
          <Text style={styles.body}>El registro de la sesión lo cierra el instructor con una evaluación.</Text>
        </Card>
      ) : null}

      {session.maniobras ? (
        <Card>
          <Text style={styles.section}>Maniobras de la sesión</Text>
          {session.maniobras.map((maneuver) => (
            <Text key={maneuver} style={styles.bullet}>
              · {maneuver}
            </Text>
          ))}
        </Card>
      ) : null}

      {linked.length > 0 ? (
        <Card>
          <Text style={styles.section}>Material de la sesión</Text>
          {linked.map((resource) => (
            <SimulatedPressable key={resource.id} accessibilityRole="button" onPress={() => router.push(`/biblioteca/${resource.id}`)}>
              <Text style={styles.link}>
                {resource.codigo ? `${resource.codigo} · ` : ''}
                {resource.titulo}
              </Text>
            </SimulatedPressable>
          ))}
        </Card>
      ) : null}

      {user.rol === 'instructor' ? (
        <Card>
          <Text style={styles.section}>Pilotos</Text>
          {trainees
            .filter((trainee) => session.audiencia === 'ambos' || session.audiencia === trainee.rol)
            .map((trainee) => {
              const traineeStatus = statusOf(snapshot.sessionProgress, trainee.id, session.id);
              return (
                <View key={trainee.id} style={styles.trainee}>
                  <Text style={styles.traineeName}>{displayName(trainee.tratamiento, trainee.nombre)}</Text>
                  <Pill label={sessionStatusLabel[traineeStatus]} tone={toneForSession(traineeStatus)} />
                </View>
              );
            })}
          <Button
            label="Registrar evaluación"
            onPress={() => router.push({ pathname: '/evaluaciones/nueva', params: { sesionId: session.id } })}
          />
        </Card>
      ) : null}

      {session.tipo === 'assessment' ? (
        <Card>
          <Text style={styles.section}>Liberación</Text>
          <Text style={styles.body}>
            El cierre de esta sesión se refleja en el estatus de liberación
            {user.rol === 'instructor' ? ', que puedes actualizar desde el panel.' : ', que consulta el capitán y confirma el instructor.'}
          </Text>
          <Button label="Ver liberación" variant="secondary" onPress={() => router.push('/liberacion')} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bullet: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  link: { color: colors.blue, fontSize: 16, fontWeight: '700', paddingVertical: 4 },
  trainee: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  traineeName: { color: colors.ink, fontSize: 16, fontWeight: '600' },
});
