const mongoose = require('mongoose');
const Lead = require('./src/lib/models/Lead');

async function run() {
  try {
    // Use the connection string from environment
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leados';
    await mongoose.connect(uri);
    const count = await mongoose.model('Lead').countDocuments();
    console.log(`Total leads in DB: ${count}`);
    const sample = await mongoose.model('Lead').findOne();
    console.log('Sample lead:', JSON.stringify(sample, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
