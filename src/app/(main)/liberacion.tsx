import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Pill, Screen, ScreenHeader } from '../../components/ui';
import { findUser, trainees } from '../../data/catalog';
import { releaseLabel, syncLabel, toneForRelease, toneForSync } from '../../data/labels';
import { ReleaseState } from '../../data/types';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/theme';
import { displayName, formatWhen } from '../../lib/text';

const options: ReleaseState[] = ['en_adiestramiento', 'en_revision', 'liberado'];

export default function LiberacionScreen() {
  const { user, snapshot, setReleaseStatus } = useApp();
  if (!user) {
    return null;
  }
  const visible = user.rol === 'copiloto' ? trainees.filter((trainee) => trainee.id === user.id) : trainees;
  const canEdit = user.rol === 'instructor';

  return (
    <Screen>
      <ScreenHeader
        kicker="Cierre del programa"
        title="Liberación a línea"
        subtitle={
          canEdit
            ? 'Confirmas el estatus de cada piloto. El capitán puede consultarlo, sin modificarlo.'
            : user.rol === 'capitan'
              ? 'Ves el estatus de la tripulación. La confirmación la hace el instructor.'
              : 'Este es tu estatus de liberación. Lo actualiza el instructor.'
        }
      />
      {visible.map((trainee) => {
        const release = snapshot.releases.find((item) => item.userId === trainee.id);
        const status = release?.status ?? 'en_adiestramiento';
        const editor = release?.updatedBy ? findUser(release.updatedBy) : undefined;
        return (
          <Card key={trainee.id}>
            <Text style={styles.kicker}>{trainee.rolLabel}</Text>
            <Text style={styles.title}>{displayName(trainee.tratamiento, trainee.nombre)}</Text>
            <View style={styles.row}>
              <Pill label={releaseLabel[status]} tone={toneForRelease(status)} />
              {release ? <Pill label={syncLabel[release.syncStatus]} tone={toneForSync(release.syncStatus)} /> : null}
            </View>
            <Text style={styles.body}>
              {release
                ? `Actualizado ${formatWhen(release.updatedAt)}${editor ? ` por ${displayName(editor.tratamiento, editor.nombre)}` : ''}.`
                : 'Sin cambios registrados.'}
            </Text>
            {canEdit ? (
              <View style={styles.actions}>
                {options.map((option) => (
                  <Button
                    key={option}
                    label={releaseLabel[option]}
                    variant={option === status ? 'primary' : 'secondary'}
                    onPress={() => setReleaseStatus(trainee.id, option)}
                  />
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.amber, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
