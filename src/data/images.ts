import { ImageSourcePropType } from 'react-native';

import { ImageKey } from './types';

/**
 * Cada imagen empieza vacía a propósito.
 * Cuando el archivo exista, quita el comentario de su línea.
 * Metro solo acepta require() con una ruta literal.
 */
export const imageSources: Partial<Record<ImageKey, ImageSourcePropType>> = {
  // 'marca/logo.png': require('../../assets/images/marca/logo.png'),
  // 'login/cabina.jpg': require('../../assets/images/login/cabina.jpg'),
  // 'biblioteca/video-inspeccion-prevuelo.jpg': require('../../assets/images/biblioteca/video-inspeccion-prevuelo.jpg'),
  // 'biblioteca/video-aproximacion.jpg': require('../../assets/images/biblioteca/video-aproximacion.jpg'),
  // 'biblioteca/esquema-cabina.jpg': require('../../assets/images/biblioteca/esquema-cabina.jpg'),
  // 'biblioteca/panel-instrumentos.jpg': require('../../assets/images/biblioteca/panel-instrumentos.jpg'),
  // 'syllabus/etapa-induccion.jpg': require('../../assets/images/syllabus/etapa-induccion.jpg'),
  // 'syllabus/etapa-vuelo.jpg': require('../../assets/images/syllabus/etapa-vuelo.jpg'),
  // 'syllabus/etapa-debrief.jpg': require('../../assets/images/syllabus/etapa-debrief.jpg'),
  // 'syllabus/etapa-assessment.jpg': require('../../assets/images/syllabus/etapa-assessment.jpg'),
};
