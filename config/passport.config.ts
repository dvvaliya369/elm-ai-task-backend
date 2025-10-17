import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
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
