const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
mongoose
  .connect('mongodb+srv://tsingla701:Qwerty%40052005@cluster0.fsh50ri.mongodb.net/Cluster0?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Define a schema for User
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create a model for User
const User = mongoose.model('User', userSchema);

// Route to handle user signup
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists in the database
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        // User already exists, send an error response
        res.status(400).send('User with this email already exists');
      } else {
        // User does not exist, create a new user document
        const newUser = new User({
          username,
          email,
          password,
        });

        // Save the user to the database
        newUser
          .save()
          .then(() => {
            // Signup successful, redirect to payment gateway
            res.redirect(process.env.STRIPE_LINK);
          })
          .catch((error) => {
            res.status(500).send('Error signing up');
          });
      }
    })
    .catch((error) => {
      res.status(500).send('Error signing up');
    });
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists in the database
  User.findOne({ email, password })
    .then((user) => {
      if (user) {
        // Login successful, redirect to payment gateway
        res.redirect(process.env.STRIPE_LINK);
      } else {
        res.status(401).send('Invalid email or password');
      }
    })
    .catch((error) => {
      res.status(500).send('Error logging in');
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
