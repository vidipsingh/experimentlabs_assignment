const jwt = require('jsonwebtoken');
const SECRET = 'your_jwt_secret';

const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token provided.');

  jwt.verify(token.split(' ')[1], SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    req.userId = decoded.id;
    next();
  });
};

module.exports = authenticateUser;
