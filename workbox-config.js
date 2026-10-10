module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,json,png,jpg,jpeg,webp,ico,svg,wasm,pdf,pdfjs,woff,woff2,ttf,txt}'],
  globIgnores: ['**/sw.js'],
  swDest: 'dist/sw.js',
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/\/manifest\.json$/, /\/sw\.js$/, /\/robots\.txt$/],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  skipWaiting: true,
  clientsClaim: true,
};
