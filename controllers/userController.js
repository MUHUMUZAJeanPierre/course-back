const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists', status:false});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            role: role || 'student'
        });
        const savedUser = await user.save();
        res.status(201).json({
            message: 'User created successfully',
            data: savedUser,
            status: true
        })
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
        
    }
}


const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', status: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).json({
            message: 'Logged in successfully',
            token,
            status: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
        
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('courses.courseId')
            .populate('courses.completedModules.moduleId');

        const usersWithProgress = users.map(user => {
            const updatedCourses = user.courses
                .filter(course => course.courseId) // Ensure courseId is not null
                .map(course => {
                    const totalModules = Array.isArray(course.courseId.modules) ? course.courseId.modules.length : 0;
                    const completedModules = course.completedModules.length;
                    const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0; 

                    return {
                        courseId: course.courseId._id,
                        courseName: course.courseId.name,
                        totalModules,
                        completedModules,
                        progress: progress.toFixed(2) + "%"
                    };
                });

            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                courses: updatedCourses
            };
        });

        res.status(200).json({
            message: 'Users retrieved successfully',
            data: usersWithProgress,
            status: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
};

