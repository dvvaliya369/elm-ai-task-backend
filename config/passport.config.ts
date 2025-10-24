import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/userSchema/user.schema';
import envConfig from './env.config';

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
    done(error, null);
  }
});

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: envConfig.GITHUB_CLIENT_ID!,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET!,
      callbackURL: envConfig.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user already exists with this GitHub ID
        let existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          existingUser = await User.findOne({ email });
          if (existingUser) {
            // Link GitHub account to existing user
            existingUser.githubId = profile.id;
            existingUser.githubUsername = profile.username;
            if (!existingUser.authProvider) {
              existingUser.authProvider = 'github';
            }
            await existingUser.save();
            return done(null, existingUser);
          }
        }

        // Create new user
        const newUser = new User({
          githubId: profile.id,
          githubUsername: profile.username,
          firstName: profile.displayName ? profile.displayName.split(' ')[0] : profile.username,
          lastName: profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : '',
          email: email,
          authProvider: 'github',
          profilePhoto: {
            photo_url: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          },
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.error('GitHub OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
