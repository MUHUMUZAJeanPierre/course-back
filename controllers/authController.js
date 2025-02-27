// const User = require('../models/User');
// const { sendVerificationEmail } = require('../service/emailService');

// const loginPage = (req, res) => {
//     if (!req.user) {
//         return res.redirect('http://localhost:3000/login?error=Unauthorized');
//     }

//     if (!req.user.isVerified) {
//         return res.redirect('http://localhost:3000/verify-email?message=Please');
//     }

//     res.redirect('http://localhost:3000/courses');
// };

// const googleCallback = async (req, res) => {
//     try {
//       if (!req.user) {
//         return res.redirect("/");
//       }
  
//       // Generate JWT token for authentication
//       const token = jwt.sign(
//         { id: req.user.id },
//         process.env.JWT_SECRET
//       );
  
//       res.status(200).json({
//         status: "success",
//         message: "User authenticated successfully",
//         token,
//         user: {
//             id: req.user.id,
//             name: req.user.name,
//             email: req.user.email
//         }
//     });
//       // Redirect to frontend with token in query params
//       res.redirect(`https://course-back-2-00rq.onrender.com/auth/callback?token=${token}`);
//     } catch (error) {
//       console.error("Google Callback Error:", error);
//       res.redirect("/");
//     }
//   };

// const profilePage = async (req, res) => {
//     if (!req.user || !req.user.isVerified) {
//         return res.send('Please verify your email to access this page.');
//     }
//     res.send(`Welcome, ${req.user.name}`);
// };

// const verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.query;
//         const user = await User.findOne({ verificationToken: token });

//         if (!user) {
//             return res.status(400).send('Invalid or expired token');
//         }

//         user.isVerified = true;
//         user.verificationToken = undefined;
//         await user.save();

//         res.send('Email verified successfully. You can now log in.');

//         res.status(200).json({
//             status: "success",
//             message: "Email verified successfully. You can now log in."
//         });
//     } catch (error) {
//         console.error('Error verifying email:', error.message);
//         res.status(500).send('Server error');
//         res.status(500).json({
//             status: "error",
//             message: "Server error while verifying email"
//         });
//     }
// };

// const logout = async (req, res, next) => {
//     try {
//         await req.logout();
//         res.clearCookie("token");
//         res.status(200).json({
//             status: "success",
//             message: "Logged out successfully"
//         });
//         res.redirect('/');
//     } catch (err) {
//         next(err);
//     }
// };

// module.exports = {
//     loginPage,
//     googleCallback,
//     profilePage,
//     verifyEmail,
//     logout,
// };
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Make sure to import jwt
const { sendVerificationEmail } = require('../service/emailService');

const loginPage = (req, res) => {
    if (!req.user) {
        return res.redirect('http://localhost:3000/login?error=Unauthorized');
    }

    if (!req.user.isVerified) {
        return res.redirect('http://localhost:3000/verify-email?message=Please');
    }

    res.redirect('http://localhost:3000/courses');
};

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
        
        // Check if this is an API request or a browser redirect
        const wantsJson = req.get('Accept') && req.get('Accept').includes('application/json');
        
        if (wantsJson) {
            // Return JSON response with user details for API clients
            return res.status(200).json({
                status: "success",
                message: "User authenticated successfully",
                token,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    isVerified: req.user.isVerified
                }
            });
        } else {
            // Redirect to frontend with token in query params for browser clients
            return res.redirect(`https://course-back-2-00rq.onrender.com/auth/callback?token=${token}`);
        }
    } catch (error) {
        console.error("Google Callback Error:", error);
        
        const wantsJson = req.get('Accept') && req.get('Accept').includes('application/json');
        if (wantsJson) {
            return res.status(500).json({
                status: "error",
                message: "Authentication failed"
            });
        } else {
            return res.redirect("/");
        }
    }
};

const profilePage = async (req, res) => {
    if (!req.user || !req.user.isVerified) {
        return res.status(401).json({
            status: "error",
            message: "Please verify your email to access this page."
        });
    }
    
    // Return user details
    return res.status(200).json({
        status: "success",
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            isVerified: req.user.isVerified
        }
    });
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Check request type and respond accordingly
        const wantsJson = req.get('Accept') && req.get('Accept').includes('application/json');
        
        if (wantsJson) {
            return res.status(200).json({
                status: "success",
                message: "Email verified successfully. You can now log in.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isVerified: true
                }
            });
        } else {
            return res.send('Email verified successfully. You can now log in.');
        }
    } catch (error) {
        console.error('Error verifying email:', error.message);
        return res.status(500).json({
            status: "error",
            message: "Server error while verifying email"
        });
    }
};

const logout = async (req, res, next) => {
    try {
        await req.logout();
        res.clearCookie("token");
        
        const wantsJson = req.get('Accept') && req.get('Accept').includes('application/json');
        
        if (wantsJson) {
            return res.status(200).json({
                status: "success",
                message: "Logged out successfully"
            });
        } else {
            return res.redirect('/');
        }
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