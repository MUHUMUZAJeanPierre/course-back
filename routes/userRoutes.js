const express = require('express');
const userRouter = express.Router();
const {registerUser, loginUser, getAllUsers} = require('../controllers/userController');
const  authenticate  = require('../middlewares/authMiddleware');

userRouter.post('/api/register', registerUser);
userRouter.post('/api/login', loginUser);
userRouter.get('/api/users', getAllUsers);
userRouter.get('/protected', authenticate, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'You have accessed a protected route',
        user: req.user
    });
});

module.exports = userRouter;