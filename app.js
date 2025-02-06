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
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for session and authentication
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Debug Middleware (optional)
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Database connection
db.connect();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Define Routes
app.use('/', userRouter);
app.use('/', SubModuleRouter);
app.use('/', ModuleRouter);
app.use('/', CourseRouter);
app.use('/', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
