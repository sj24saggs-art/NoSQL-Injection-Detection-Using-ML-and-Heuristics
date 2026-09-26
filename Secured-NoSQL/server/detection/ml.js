const axios = require('axios');

async function detectInjection(input) {
  try {
    const res = await axios.post('http://localhost:5001/predict', {
      input: input
    });

    return res.data.result === 'suspicious';

  } catch (err) {
    console.error('ML API error:', err.message);

    // Fail-safe: treat detection failure as suspicious
    return true;
  }
}

module.exports = { detectInjection };