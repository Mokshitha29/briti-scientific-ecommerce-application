const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'briti_scientific_jwt_secret_key_2026_prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
