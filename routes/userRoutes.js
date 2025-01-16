const express = require('express');
const userRouter = express.Router();
const {registerUser, loginUser} = require('../controllers/userController');
const  authenticate  = require('../middlewares/authMiddleware');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/protected', authenticate, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'You have accessed a protected route',
        user: req.user
    });
});

module.exports = userRouter;