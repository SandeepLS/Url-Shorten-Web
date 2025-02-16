const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require('../models/user')

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
        
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                    });
                }
        
                const userObj = {
                    id: user.id,
                    googleId: user.googleId,
                    displayName: user.displayName,
                    email: user.email,
                    avatar: user.avatar
                };
        
                const token = jwt.sign(userObj, process.env.JWT_SECRET, { expiresIn: "7d" });
        
                return done(null, { user: userObj, token });
            } catch (error) {
                return done(error, null);
            }
        
        }
    )
);

// Serialize user session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
