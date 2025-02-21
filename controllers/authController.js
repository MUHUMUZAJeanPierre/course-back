const User = require('../models/User');
const { sendVerificationEmail } = require('../service/emailService');

const loginPage = (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
};

// const googleCallback = (req, res) => {
//     res.redirect('/profile');
// };
const googleCallback = async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/");
      }
  
      // Generate JWT token for authentication
      const token = jwt.sign(
        { id: req.user.id },
        process.env.JWT_SECRET
      );
  
      // Redirect to frontend with token in query params
      res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Google Callback Error:", error);
      res.redirect("/");
    }
  };

const profilePage = async (req, res) => {
    if (!req.user || !req.user.isVerified) {
        return res.send('Please verify your email to access this page.');
    }
    res.send(`Welcome, ${req.user.name}`);
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid or expired token');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send('Email verified successfully. You can now log in.');
    } catch (error) {
        console.error('Error verifying email:', error.message);
        res.status(500).send('Server error');
    }
};

const logout = async (req, res, next) => {
    try {
        await req.logout();
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    loginPage,
    googleCallback,
    profilePage,
    verifyEmail,
    logout,
};
