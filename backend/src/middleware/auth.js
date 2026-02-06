import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // TODO: Consider whether to allow certain public routes without authentication
    // For now, all API routes require a token
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}
