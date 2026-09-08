const APK_TRACK_URL =
  'https://us-central1-studio-2294305185-c0b44.cloudfunctions.net/api/download/apk';

module.exports = (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(302, { Location: APK_TRACK_URL });
  res.end();
};
