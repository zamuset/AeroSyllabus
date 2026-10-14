import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SoftPressable } from '../../../components/motion';
import { Button, Screen, ScreenHeader } from '../../../components/ui';
import { sessions, trainees } from '../../../data/catalog';
import { evalResultLabel } from '../../../data/labels';
import { EvalResult } from '../../../data/types';
import { useApp } from '../../../state/AppContext';
import { colors } from '../../../theme/theme';
import { displayName, param } from '../../../lib/text';

const results: EvalResult[] = ['dominada', 'a_reforzar', 'no_aprobada'];

export default function NuevaEvaluacionScreen() {
  const { user, createEvaluation } = useApp();
  const params = useLocalSearchParams<{ traineeId?: string | string[]; sesionId?: string | string[] }>();
  const initialTrainee = param(params.traineeId);
  const initialSession = param(params.sesionId);
  const [traineeId, setTraineeId] = useState(initialTrainee ?? trainees[0]?.id ?? '');
  const [sessionId, setSessionId] = useState(initialSession ?? 'ses-maniobras');
  const [maneuver, setManeuver] = useState('');
  const [result, setResult] = useState<EvalResult>('dominada');
  const [notes, setNotes] = useState('');
  const [reschedule, setReschedule] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialTrainee) {
      setTraineeId(initialTrainee);
    }
    if (initialSession) {
      setSessionId(initialSession);
    }
  }, [initialSession, initialTrainee]);

  if (!user) {
    return null;
  }
  if (user.rol !== 'instructor') {
    return (
      <Screen>
        <ScreenHeader title="Solo el instructor registra" subtitle="Puedes consultar las evaluaciones desde la lista." back />
      </Screen>
    );
  }

  const session = sessions.find((item) => item.id === sessionId);
  const suggestions = session?.maniobras ?? [];

  async function save() {
    if (!traineeId || !sessionId || maneuver.trim().length === 0) {
      setMessage('Elige piloto, sesión y escribe la maniobra.');
      return;
    }
    setBusy(true);
    const error = await createEvaluation({
      traineeId,
      sessionId,
      maneuver,
      result,
      notes,
      reschedule,
    });
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    router.replace('/evaluaciones');
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Nueva evaluación"
        title="Registrar observación"
        subtitle="Si la maniobra no queda dominada y marcas repaso, la sesión del piloto pasa a repaso asignado."
        back
      />
      <Text style={styles.label}>Piloto</Text>
      <View style={styles.choices}>
        {trainees.map((trainee) => (
          <Choice key={trainee.id} active={trainee.id === traineeId} label={displayName(trainee.tratamiento, trainee.nombre)} onPress={() => setTraineeId(trainee.id)} />
        ))}
      </View>
      <Text style={styles.label}>Sesión</Text>
      <View style={styles.choices}>
        {sessions.map((item) => (
          <Choice key={item.id} active={item.id === sessionId} label={item.titulo} onPress={() => setSessionId(item.id)} />
        ))}
      </View>
      <Text style={styles.label}>Maniobra</Text>
      {suggestions.length > 0 ? (
        <View style={styles.choices}>
          {suggestions.map((item) => (
            <Choice key={item} active={maneuver === item} label={item} onPress={() => setManeuver(item)} />
          ))}
        </View>
      ) : null}
      <TextInput
        value={maneuver}
        onChangeText={setManeuver}
        placeholder="Nombre de la maniobra"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Text style={styles.label}>Resultado</Text>
      <View style={styles.choices}>
        {results.map((item) => (
          <Choice key={item} active={item === result} label={evalResultLabel[item]} onPress={() => setResult(item)} />
        ))}
      </View>
      <Text style={styles.label}>Notas</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Qué se observó y qué hay que reforzar"
        placeholderTextColor={colors.muted}
        multiline
        style={[styles.input, styles.notes]}
      />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Asignar repaso de la sesión</Text>
        <Switch value={reschedule} onValueChange={setReschedule} />
      </View>
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <Button label={busy ? 'Guardando…' : 'Guardar evaluación'} onPress={save} disabled={busy} />
    </Screen>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <SoftPressable accessibilityRole="button" onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </SoftPressable>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 4 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 8 },
  choiceActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  choiceText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  choiceTextActive: { color: colors.white },
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
  notes: { minHeight: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  switchLabel: { color: colors.ink, fontSize: 15, flex: 1 },
  error: { color: colors.red, fontSize: 14 },
});
