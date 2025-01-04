import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email_user_,
    pass: process.env.Email_password,
  },
});

export const sendMail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.Email_user_,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};