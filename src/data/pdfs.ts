export const pdfModules: Record<string, number> = {
  'aa-210': require('../../assets/manuales/AA_210.pdf'),
  'aa-260': require('../../assets/manuales/AA_260.pdf'),
  'aa-301': require('../../assets/manuales/AA_301.pdf'),
  'aa-302': require('../../assets/manuales/AA_302.pdf'),
  'aa-310': require('../../assets/manuales/AA_310.pdf'),
};

export const pdfJsModule: number = require('../../assets/vendor/pdf.min.pdfjs');
export const pdfWorkerModule: number = require('../../assets/vendor/pdf.worker.min.pdfjs');
