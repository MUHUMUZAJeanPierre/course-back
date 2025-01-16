const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const SubModuleRouter = require('./routes/SubmoduleRoutes');
const ModuleRouter = require('./routes/ModuleRoutes');
const CourseRouter = require('./routes/courseRoutes');
const userRouter = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/', userRouter);
app.use('/', SubModuleRouter);
app.use('/', ModuleRouter);
app.use('/', CourseRouter);

db.connect();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
