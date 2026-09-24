const generateTransactionId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DEMO-TXN-${year}${month}${day}-${randomSuffix}`;
};

module.exports = generateTransactionId;
