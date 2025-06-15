import Mailjet from 'node-mailjet';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Initialize mailjet with conditional check for dummy keys
const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC || '';
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE || '';
const isDummyKeys = MJ_APIKEY_PUBLIC === 'dummy_key' || MJ_APIKEY_PRIVATE === 'dummy_key';

// Only initialize mailjet if not using dummy keys
const mailjet = !isDummyKeys ? Mailjet.apiConnect(
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE
) : null;

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // If using dummy keys, log the email details but don't actually send
    if (isDummyKeys) {
      console.log('EMAIL SENDING SKIPPED (using dummy keys):', {
        to: options.to,
        subject: options.subject,
      });
      return true;
    }
    
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM || 'noreply@aibeautylens.com',
            Name: process.env.EMAIL_FROM_NAME || 'AIBeautyLens System',
          },
          To: [
            {
              Email: options.to,
              Name: options.to.split('@')[0],
            },
          ],
          Subject: options.subject,
          HTMLPart: options.html,
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

export async function sendVerificationEmail(to: string, name: string, verificationToken: string): Promise<boolean> {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  return sendEmail({
    to,
    subject: 'Welcome to AIBeautyLens - Verify Your Email',
    html: `
      <h2>Welcome to AIBeautyLens!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering. Please verify your email by clicking the following link:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to,
    subject: 'AIBeautyLens - Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>You have requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
} 