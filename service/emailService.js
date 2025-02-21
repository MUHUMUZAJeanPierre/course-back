const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const verificationLink = `https://course-back-2-00rq.onrender.com/verify-email?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Verification',
            html: `<p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationLink}">Verify Email</a>`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error.message);
    }
};

module.exports = { sendVerificationEmail };
