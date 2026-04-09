import nodemailer from "nodemailer";

/**
 * @desc    Utility to send plain text or HTML emails
 * @param   {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
  // 1) Create a transporter
  // Note: secure: true is usually for port 465, false for 587 or 25
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Useful for self-signed certificates in some dev environments
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `Inventory Admin <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Enabled so you can send styled reset links later
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("📧 Email Service Error:", err);
    throw new Error("Email could not be sent.");
  }
};

export default sendEmail;
