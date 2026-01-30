import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { Any } from 'typeorm';

dotenv.config();



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8082/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Here, integrate with your database
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0].value,
        provider: 'google',
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
