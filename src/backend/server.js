const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes');
const profileRoute = require('./profileRoute');
const cookieParser = require("cookie-parser");
// Load environment variables
dotenv.config();

// Import configuration file
const config = require('./config/config');  // Import config.js file

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(profileRoute);
app.use(cookieParser());
// Database connection
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api', routes);

// Test route
app.get('/', (req, res) => {
  res.send('AuctiSM Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
