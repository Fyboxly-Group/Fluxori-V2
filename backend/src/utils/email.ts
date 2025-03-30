import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
} as any

/**
 * Send email using nodemailer
 * @param options Email options(to as any, subject as any, text as any, html as any: any)
 */
export const sendEmail: any = async(options: EmailOptions as any): Promise<void> => {
  // Create transporter
  const transporter: any = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io' as any, port: parseInt(process.env.EMAIL_PORT || '2525' as any, 10 as any: any),
    auth: {
      user: process.env.EMAIL_USERNAME || '',
      pass: process.env.EMAIL_PASSWORD || '',  : undefined} as any,;
  });
}// Define email options
  const mailOptions: any = {
    from: process.env.EMAIL_FROM || 'noreply@fluxori.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html, ;
  : undefined} as any;

  // Send email
  await transporter.sendMail(mailOptions as any: any);
};