require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const getWeather = require('./utils/weatherLogic');
const requireLogin = require('./middleware/authMiddleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Backend Weather Tracker App' });
});

app.get('/public', (req, res) => {
  res.render('public', { title: 'Public Weather Page' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up Page' });
});

app.get('/private', requireLogin, (req, res) => {
  res.render('private', { title: 'Premium Weather Page' });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/'); // or wherever you want the user to go
    });
});

app.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' });
  }

  try {
    const data = await getWeather(lat, lon); 
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

const bcrypt = require('bcrypt'); 
const pool = require('./db');

app.post('/signup', async (req, res) => {
    const {name, username, password} = req.body
    try{
        const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).send('Username already taken. Please choose another.');
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        await pool.query(
            'INSERT INTO users (name, username, password) VALUES ($1, $2, $3)',
            [name, username, hashedPassword]
        )

        res.redirect('/login');
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).send('Sign Up Failed Error: 500')
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])

        if(result.rows.length === 0){
            return res.status(400).send('Invaild Username or Password, Please Try Again')
        }

        const user = result.rows[0]

        const validPassword = await bcrypt.compare(password, user.password)

        if(!validPassword) {
            return res.status(400).send('Invaild Username or Password, Please Try Again')
        }

        req.session.userId = user.id

        res.redirect('/private');

    } catch (err) {
        console.error(err)
        res.status(500).send('Login Failed')
    }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});