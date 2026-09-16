const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/follow-ups', require('./routes/follow-ups'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/team', require('./routes/team'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/ai-calls', require('./routes/ai-calls'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/activity', require('./routes/activity'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
