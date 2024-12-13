const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
  },
  async (request, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email }
      });

      if (existingUser) {
        return done(null, existingUser);
      }

      // If not, create a new user
      const newUser = await prisma.user.create({
        data: {
          email: profile.email,
          password: '', // Password can be empty for OAuth users
        }
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;