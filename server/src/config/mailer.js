import nodemailer from 'nodemailer';

const emailConfigured =
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`Email disabled: would send to ${to} with subject "${subject}".`);
    console.log(html);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CampusKart" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};
