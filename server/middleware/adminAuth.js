export default function adminAuth(req, res, next) {
  const key = req.get('x-admin-key');

  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorised.' });
  }

  return next();
}
