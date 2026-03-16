// Email utility - placeholder for email service integration
// You can integrate with SendGrid, Mailgun, AWS SES, or any other email service

const sendEmail = async (options) => {
  // Placeholder implementation
  // In production, integrate with your preferred email service
  
  console.log('Sending email:', {
    to: options.to,
    subject: options.subject,
    // body: options.html || options.text
  });
  
  // Return success for now
  return {
    success: true,
    messageId: `mock-${Date.now()}`
  };
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Artisan Marketplace!',
    html: `
      <h1>Welcome ${user.firstName}!</h1>
      <p>Thank you for joining Artisan Marketplace. We're excited to have you on board!</p>
    `
  });
};

// Send booking confirmation email
const sendBookingConfirmation = async (user, booking, artisan) => {
  return sendEmail({
    to: user.email,
    subject: 'Booking Confirmation',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Your booking with ${artisan.firstName} ${artisan.lastName} has been confirmed.</p>
      <p>Booking Reference: ${booking.bookingNumber}</p>
      <p>Scheduled Date: ${booking.scheduledDate}</p>
      <p>Service: ${booking.service}</p>
    `
  });
};

// Send payment receipt
const sendPaymentReceipt = async (user, payment, booking) => {
  return sendEmail({
    to: user.email,
    subject: 'Payment Receipt',
    html: `
      <h1>Payment Receipt</h1>
      <p>Thank you for your payment!</p>
      <p>Reference: ${payment.reference}</p>
      <p>Amount: ₦${payment.amount}</p>
      <p>Booking: ${booking.bookingNumber}</p>
    `
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendPasswordResetEmail
};
