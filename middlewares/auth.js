const jwt = require('jsonwebtoken');
const SECRET_KEY = 'sekreti_im';

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

exports.authorize = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).send('Access forbidden');
    next();
  };
};
