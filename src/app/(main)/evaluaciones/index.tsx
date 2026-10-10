import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Card, Pill, Screen, ScreenHeader } from '../../../components/ui';
import { findSession, findUser } from '../../../data/catalog';
import { evalResultLabel, syncLabel, toneForResult, toneForSync } from '../../../data/labels';
import { useApp } from '../../../state/AppContext';
import { colors } from '../../../theme/theme';
import { displayName, formatWhen } from '../../../lib/text';

export default function EvaluacionesScreen() {
  const { user, snapshot } = useApp();
  if (!user) {
    return null;
  }
  const rows =
    user.rol === 'instructor'
      ? snapshot.evaluations
      : snapshot.evaluations.filter((item) => item.traineeId === user.id);

  return (
    <Screen>
      <ScreenHeader
        kicker="Evaluación continua"
        title="Evaluaciones"
        subtitle={
          user.rol === 'instructor'
            ? 'Cada registro queda en el dispositivo. Si cortas la red simulada, se marca pendiente de envío.'
            : 'Aquí ves las observaciones que el instructor dejó en tu ruta.'
        }
      />
      {user.rol === 'instructor' ? (
        <Button label="Nueva evaluación" onPress={() => router.push('/evaluaciones/nueva')} />
      ) : null}
      {rows.length === 0 ? (
        <Card>
          <Text style={styles.title}>Todavía no hay evaluaciones</Text>
          <Text style={styles.body}>
            {user.rol === 'instructor'
              ? 'Registra una maniobra de la sesión de vuelo o del debriefing para ver el flujo completo.'
              : 'Cuando el instructor registre una observación, aparecerá en esta lista.'}
          </Text>
        </Card>
      ) : (
        rows.map((item) => {
          const trainee = findUser(item.traineeId);
          const session = findSession(item.sessionId);
          return (
            <Card key={item.id}>
              <View style={styles.top}>
                <Text style={styles.kicker}>{formatWhen(item.createdAt)}</Text>
                <Pill label={syncLabel[item.syncStatus]} tone={toneForSync(item.syncStatus)} />
              </View>
              <Text style={styles.title}>{item.maneuver}</Text>
              <Text style={styles.body}>
                {trainee ? displayName(trainee.tratamiento, trainee.nombre) : 'Piloto'} · {session?.titulo ?? 'Sesión'}
              </Text>
              <View style={styles.top}>
                <Pill label={evalResultLabel[item.result]} tone={toneForResult(item.result)} />
                {item.reschedule ? <Pill label="Repaso asignado" tone="warn" /> : null}
              </View>
              {item.notes ? <Text style={styles.body}>{item.notes}</Text> : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  kicker: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 21 },
});
