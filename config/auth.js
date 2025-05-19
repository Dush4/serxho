module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'sekreti_default',
  jwtExpiration: '1h'
};
