const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendVerificationEmail } = require('../service/emailService');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://course-back-2-00rq.onrender.com/auth/google/callback",
            
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    const token = crypto.randomBytes(32).toString('hex');
                    const newUser = new User({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        password: crypto.randomBytes(16).toString('hex'),
                        isVerified: false,
                        verificationToken: token,
                    });

                    await newUser.save();
                    await sendVerificationEmail(newUser.email, token);

                    return done(null, newUser);
                }

                if (!user.isVerified) {
                    return done(null, false, { message: 'Please verify your email to continue' });
                }

                return done(null, user);
            } catch (error) {
                console.error('Error during OAuth authentication:', error);
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
