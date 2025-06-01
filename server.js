const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// TODO: Replace these with your Google OAuth2 credentials
const GOOGLE_CLIENT_ID = '755429138864-ko8hlpa2gju85jeaal3u2senfoo62qcc.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

// Nodemailer setup (replace with your Gmail & app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'honest.oigo@strathmore.edu',       // Your Gmail address
    pass: 'jtfm fess swdp sbxs'           // Your Gmail app password
  }
});

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // Send notification email when user signs in
    const mailOptions = {
      from: 'lilskide@gmail.com',
      to: 'nextedgeinnovations.org@gmail.com',  // Send notification to yourself
      subject: 'New User Signed In',
      text: `User signed in: ${profile.displayName} (${profile.emails[0].value})`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Notification email sent:', info.response);
      }
    });

    return cb(null, profile);
  }
));

// Express middleware
app.use(session({
  secret: 'some secret key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware to require login for protected routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Public homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Google OAuth2 login start
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth2 callback URL
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to protected page.
    res.redirect('/protected');
  }
);

// Protected routes
app.get('/protected', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/protected.html'));
});
app.get('/about', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});
app.get('/applications', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/applications.html'));
});
app.get('/tools', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/tools.html'));
});
app.get('/contact', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/contact.html'));
});
app.get('/domain', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/domain.html'));
});
app.get('/hosting', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/hosting.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
