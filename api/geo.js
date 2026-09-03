// Temporarily Cameroon-only — MoMo checkout is CM for now.
// Re-expand to CEMAC + NG when payment supports those markets.
const MOMO = new Set(['CM']);
module.exports = (req, res) => {
  const country = (req.headers['x-vercel-ip-country'] || '').toUpperCase();
  const channel = MOMO.has(country) ? 'apk' : 'play';
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({ country: country || null, channel });
};
