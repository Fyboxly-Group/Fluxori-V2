const fs = require('fs');
const path = require('path');

/**
 * Script to fix the email utility file
 */

const emailUtilityContent = `import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email using nodemailer
 * @param options Email options (to, subject, text, html)
 */
export const sendEmail = async(options: EmailOptions): Promise<void> => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: process.env.EMAIL_USERNAME || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@fluxori.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};`;

const emailUtilityPath = path.join(__dirname, '../src/utils/email.ts');

console.log(`Fixing email utility at ${emailUtilityPath}...`);
fs.writeFileSync(emailUtilityPath, emailUtilityContent);
console.log('Email utility fixed!');