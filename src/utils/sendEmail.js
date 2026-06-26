const { createTransporter } = require('../config/email');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'ContentOS <noreply@contentos.dev>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
