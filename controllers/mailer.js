import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email_user,
    pass: process.env.Email_password,
  },
});

export const sendMail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.Email_user,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};