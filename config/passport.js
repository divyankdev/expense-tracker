const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { query } = require('../utils/db'); // Assuming db.js is in utils
const userService = require('../services/userService'); // Import userService
const authService = require('../services/authService'); // Import authService

const configurePassport = (passport) => {
  // Configure the Google OAuth 2.0 strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_GOOGLE_CLIENT_ID', // Use placeholder if env var not set
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_GOOGLE_CLIENT_SECRET', // Use placeholder if env var not set
      callbackURL: process.env.GOOGLE_CALLBACK_URL ,
      // || '/auth/google/callback', // Use placeholder if env var not set
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create the user in your database
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Check if user exists
        let user = await userService.getUserByEmail(email); // Use userService to find user by email

        if (!user) {
          // If user does not exist, create a new one
          const newUser = {
            email: email,
            first_name: profile.name.givenName || '',
            last_name: profile.name.familyName || null, // Allow null for last_name
            profile_picture_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            password_hash: null, // Users signing in with Google won't have a traditional password
            // Add any other necessary fields from the profile or defaults
            phone_number: null,
            date_of_birth: null,
            is_active: true, // Assuming new users are active
          };
          user = await userService.createUser(newUser); // Use userService to create the new user
        }

        // Return the user
        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  ));

  // Configure passport to serialize and deserialize users
  // This is primarily for session management, which might not be used for API authentication
  // but is often part of standard Passport setup.
  passport.serializeUser((user, done) => {
    done(null, user.user_id); // Use user_id to serialize the user
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id]);
      const user = rows[0];
      done(null, user); // Deserialize user based on user_id
    } catch (error) {
      done(error);
    }
  });
};


module.exports = configurePassport;
