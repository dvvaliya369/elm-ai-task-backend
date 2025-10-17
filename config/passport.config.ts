import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcryptjs from 'bcryptjs';
import User from '../models/userSchema/user.schema';
import { UserDocument } from '../models/userSchema/type.userSchema';
import envConfig from './env.config';

// Local Strategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      // Find user by email
      const user: UserDocument | null = await User.findOne({ email });
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Return user if authentication successful
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for token-based authentication
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: envConfig.JWT_SECRET || envConfig.JWT_SECRET_AUTH || 'fallback-secret'
  },
  async (jwtPayload: any, done: any) => {
    try {
      const user: UserDocument | null = await User.findById(jwtPayload._id);
      
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: envConfig.GOOGLE_CLIENT_ID!,
    clientSecret: envConfig.GOOGLE_CLIENT_SECRET!,
    callbackURL: envConfig.GOOGLE_CALLBACK_URL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user already exists with this email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = 'google';
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        provider: 'google',
        profilePhoto: {
          photo_url: profile.photos[0].value
        }
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy(
  {
    clientID: envConfig.GITHUB_CLIENT_ID!,
    clientSecret: envConfig.GITHUB_CLIENT_SECRET!,
    callbackURL: envConfig.GITHUB_CALLBACK_URL
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ githubId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user already exists with this email
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      
      if (email) {
        user = await User.findOne({ email: email });
        
        if (user) {
          // Link GitHub account to existing user
          user.githubId = profile.id;
          user.provider = 'github';
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      const newUser = new User({
        githubId: profile.id,
        firstName: profile.displayName ? profile.displayName.split(' ')[0] : profile.username,
        lastName: profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : '',
        email: email || `${profile.username}@github.local`, // GitHub might not provide email
        provider: 'github',
        profilePhoto: {
          photo_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
        }
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
