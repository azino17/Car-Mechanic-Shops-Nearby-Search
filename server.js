const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const { PythonShell } = require('python-shell');

const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this to handle JSON requests

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/automateDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Define a schema with the specified collection name
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { collection: 'users' });

// Create a model
const User = mongoose.model('User', userSchema);

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Serve the registration form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve the login form
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve the service page
app.get('/service', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'service.html'));
});

// Handle registration form submission
app.post('/register', async (req, res) => {
  try {
    const { name, mobile, email, password, confirmPassword } = req.body;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match.');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email id already exists.');
    }

    // Create a new user
    const newUser = new User({
      name,
      mobile,
      email,
      password,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser);

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).send('Error registering user. Please try again later.');
  }
});

// Handle login form submission
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).send('<script>alert("Incorrect email or password"); window.location.href="/login";</script>');
    }

    // Login successful, redirect to service page
    res.redirect('/service');
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).send('Error logging in. Please try again later.');
  }
});

// Route to handle recommendation
app.post('/api/recommend', (req, res) => {
  const { address, pincode, city } = req.body;
  
  const options = {
    mode: 'json',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, 'backend'), // path to your python script
    args: [address, pincode, city]
  };

  PythonShell.run('recommend.py', options, function (err, results) {
    if (err) {
      console.error('Error running Python script:', err);
      return res.status(500).send('Error generating recommendations. Please try again later.');
    }
    // results is an array consisting of messages collected during execution
    res.json(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
