// pages/api/auth/validate.js
import isTokenValid from '@/utils/validateToken'; // Your token validation logic

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log("hellooooo",token);
  if (!token || !isTokenValid(token)) {
    return res.status(401).json({ message: 'Invalid or missing token' });
  }

  return res.status(200).json({ message: 'Valid token' });
}
