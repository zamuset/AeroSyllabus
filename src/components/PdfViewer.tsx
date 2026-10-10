import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { WebView } from 'react-native-webview';

import { pdfJsModule, pdfWorkerModule } from '../data/pdfs';
import { colors } from '../theme/theme';

type Props = {
  pdfModule: number;
  fileName: string;
};

export function PdfViewer({ pdfModule, fileName }: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [readAccess, setReadAccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    setUri(null);
    (async () => {
      try {
        const directory = new Directory(Paths.cache, 'aerosyllabus-visor');
        directory.create({ intermediates: true, idempotent: true });
        await placeAsset(pdfJsModule, directory, 'pdf.min.js');
        await placeAsset(pdfWorkerModule, directory, 'pdf.worker.min.js');
        const pdfAsset = Asset.fromModule(pdfModule);
        await pdfAsset.downloadAsync();
        if (!pdfAsset.localUri) {
          throw new Error('El archivo no está disponible dentro de la app.');
        }
        const htmlFile = new File(directory, `visor-${fileName}.html`);
        if (htmlFile.exists) {
          htmlFile.delete();
        }
        htmlFile.create();
        htmlFile.write(buildViewerHtml(new File(pdfAsset.localUri).base64Sync()));
        if (!active) {
          return;
        }
        const access = directory.uri.endsWith('/') ? directory.uri : `${directory.uri}/`;
        setReadAccess(access);
        setUri(htmlFile.uri);
      } catch (caught) {
        if (!active) {
          return;
        }
        const message = caught instanceof Error ? caught.message : 'No se pudo abrir el PDF.';
        setError(message);
      }
    })();
    return () => {
      active = false;
    };
  }, [fileName, pdfModule]);

  if (error) {
    return (
      <View style={styles.message}>
        <Text style={styles.errorTitle}>No se pudo mostrar el PDF</Text>
        <Text style={styles.errorBody}>{error}</Text>
      </View>
    );
  }

  if (!uri || !readAccess) {
    return (
      <View style={styles.message}>
        <ActivityIndicator color={colors.navy} />
        <Text style={styles.loading}>Preparando el documento en el dispositivo…</Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ uri }}
      allowingReadAccessToURL={readAccess}
      allowFileAccess
      allowUniversalAccessFromFileURLs
      domStorageEnabled
      style={styles.web}
      setSupportMultipleWindows={false}
    />
  );
}

async function placeAsset(moduleId: number, directory: Directory, filename: string): Promise<File> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('El archivo no está disponible dentro de la app.');
  }
  const source = new File(asset.localUri);
  const target = new File(directory, filename);
  source.copySync(target, { overwrite: true });
  return target;
}

function buildViewerHtml(base64: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; background: #EEF2F5; font-family: -apple-system, sans-serif; }
    #pages { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px; }
    canvas { background: white; width: min(100%, 900px); height: auto; box-shadow: 0 8px 24px rgba(11, 28, 44, 0.12); }
    #error { display: none; margin: 24px; padding: 16px; background: #F8E8E8; color: #8E2F2F; border-radius: 12px; }
  </style>
</head>
<body>
  <div id="error"></div>
  <div id="pages"></div>
  <script src="pdf.min.js"></script>
  <script>
    const b64 = ${JSON.stringify(base64)};
    const errorBox = document.getElementById('error');
    function fail(message) {
      errorBox.style.display = 'block';
      errorBox.textContent = message;
    }
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', window.location.href).toString();
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      pdfjsLib.getDocument({ data: bytes }).promise.then(async (pdf) => {
        const holder = document.getElementById('pages');
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          holder.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }
      }).catch((error) => fail(error && error.message ? error.message : 'No se pudo dibujar el PDF.'));
    } catch (error) {
      fail(error && error.message ? error.message : 'No se pudo iniciar el visor.');
    }
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: colors.canvas, borderRadius: 16, overflow: 'hidden' },
  message: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
  },
  loading: { color: colors.muted, fontSize: 15 },
  errorTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  errorBody: { color: colors.muted, fontSize: 14, textAlign: 'center' },
});
