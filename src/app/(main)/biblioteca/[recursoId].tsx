import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { PdfViewer } from '../../../components/PdfViewer';
import { Button, ImageSlot, Pill, Screen, ScreenHeader } from '../../../components/ui';
import { findResource, program } from '../../../data/catalog';
import { pdfModules } from '../../../data/pdfs';
import { readingStatusLabel, resourceKindLabel, syncLabel, toneForSync } from '../../../data/labels';
import { useApp } from '../../../state/AppContext';
import { colors } from '../../../theme/theme';
import { param } from '../../../lib/text';

export default function RecursoScreen() {
  const { recursoId } = useLocalSearchParams<{ recursoId?: string | string[] }>();
  const id = param(recursoId);
  const resource = id ? findResource(id) : undefined;
  const { user, snapshot, setReadingStatus } = useApp();

  if (!user || !resource) {
    return (
      <Screen>
        <ScreenHeader title="Material no encontrado" back />
      </Screen>
    );
  }

  const reading = snapshot.readingProgress.find((row) => row.userId === user.id && row.resourceId === resource.id);
  const pdfModule = resource.kind === 'pdf' ? pdfModules[resource.id] : undefined;

  return (
    <Screen scroll={resource.kind !== 'pdf'}>
      <ScreenHeader
        kicker={resource.codigo ?? resourceKindLabel[resource.kind]}
        title={resource.titulo}
        subtitle={resource.descripcion}
        back
      />
      <View style={styles.pills}>
        <Pill label={readingStatusLabel[reading?.status ?? 'no_leido']} tone={reading?.status === 'leido' ? 'ok' : 'neutral'} />
        {reading ? <Pill label={syncLabel[reading.syncStatus]} tone={toneForSync(reading.syncStatus)} /> : null}
      </View>
      {reading?.status === 'leido' ? null : (
        <Button label="Marcar como consultado" onPress={() => setReadingStatus(resource.id, 'leido')} />
      )}
      {resource.kind === 'pdf' && pdfModule !== undefined ? (
        <View style={styles.viewer}>
          <Text style={styles.file}>Archivo en el proyecto: assets/manuales/{resource.archivo}</Text>
          <Text style={styles.note}>{program.nota}</Text>
          <PdfViewer pdfModule={pdfModule} fileName={resource.archivo ?? `${resource.id}.pdf`} />
        </View>
      ) : (
        <View style={styles.placeholder}>
          {resource.imageKey ? <ImageSlot imageKey={resource.imageKey} label={resource.titulo} aspectRatio={16 / 9} /> : null}
          <Text style={styles.note}>
            Este espacio queda reservado. Cuando tengas el archivo, colócalo en la ruta que indica el recuadro y actívalo en src/data/images.ts.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  viewer: { flex: 1, gap: 8, minHeight: 0 },
  file: { color: colors.muted, fontSize: 13 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  placeholder: { gap: 12 },
});
