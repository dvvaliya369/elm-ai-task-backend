import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import envConfig from "./env.config";
import User from "../models/userSchema/user.schema";
import { UserDocument } from "../models/userSchema/type.userSchema";

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: envConfig.GITHUB_CLIENT_ID as string,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET as string,
      callbackURL: envConfig.GITHUB_CALLBACK_URL as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        // Check if user already exists with this GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with the same email
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.username}@github.user`;

        user = await User.findOne({ email });

        if (user) {
          // Link GitHub account to existing user
          user.githubId = profile.id;
          user.oauthProvider = "github";
          await user.save();
          return done(null, user);
        }

        // Create new user
        const displayName = profile.displayName || profile.username || "GitHub User";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "GitHub";
        const lastName = nameParts.slice(1).join(" ") || "User";

        const newUser: Partial<UserDocument> = {
          firstName,
          lastName,
          email,
          githubId: profile.id,
          oauthProvider: "github",
          profilePhoto: {
            photo_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
          },
        };

        const createdUser = await User.create(newUser);
        return done(null, createdUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
