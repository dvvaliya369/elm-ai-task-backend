import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/userSchema/user.schema";
import { UserDocument } from "../models/userSchema/type.userSchema";

// Local Strategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email instead of username
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check password using the existing comparePassword method
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Authentication succeeded
      return done(null, user);
    } catch (error) {
      return done(error);
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
    const user = await User.findById(id).select('-password -refreshToken');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
