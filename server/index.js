// server/index.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for the backend

// --- MIDDLEWARE ---
app.use(cors()); // Allow cross-origin requests (from your React app)
app.use(express.json()); // Allow the server to understand JSON data in request bodies

// --- MOCK DATABASE ---
// In a real application, this data would come from a database like MongoDB or PostgreSQL.
// We are linking data to a user ID, which you would get from the Telegram Mini App.
const users = {
  '123456789': { // Example Telegram User ID
    balance: 1500,
    spins: 3,
    isVip: false,
    tasks: [
        { id: 1, title: 'Win 3 Games', reward: 100, completed: false },
        { id: 2, title: 'Invite a Friend', reward: 50, completed: true },
        { id: 3, title: 'Spin the Wheel 3 Times', reward: 20, completed: false },
    ]
  }
};


// --- API ROUTES ---

// GET endpoint to fetch a user's data
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userData = users[userId];

  if (userData) {
    console.log(`Fetched data for user ${userId}`);
    res.json(userData);
  } else {
    console.log(`No data for user ${userId}, creating default user.`);
    const defaultUser = {
      balance: 500,
      spins: 3,
      isVip: false,
      tasks: [
        { id: 1, title: 'Win your first game!', reward: 50, completed: false }
      ]
    };
    users[userId] = defaultUser;
    res.status(201).json(defaultUser);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
