import nodemailer from 'nodemailer'

/**
 * Create email transporter
 * Configure based on your email service (Gmail, SendGrid, etc.)
 */
function createTransporter() {
  // For development, you can use Gmail or a service like Mailtrap
  // For production, use a proper email service (SendGrid, AWS SES, etc.)
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return transporter
}

/**
 * Send email notification
 */
export async function sendEmailNotification(userEmail, userName, notification) {
  try {
    // Check if email notifications are enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email notifications disabled, skipping email send')
      return false
    }

    if (!userEmail) {
      console.log('No email address for user, skipping email send')
      return false
    }

    const transporter = createTransporter()
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const fullLink = notification.link ? `${siteUrl}${notification.link}` : `${siteUrl}/notifications`

    const emailContent = getEmailTemplate(notification, userName, fullLink)

    const mailOptions = {
      from: `"BYU-Idaho Education Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Get email template based on notification type
 */
function getEmailTemplate(notification, userName, link) {
  const { type, title, message } = notification
  const siteName = 'BYU-Idaho Education Platform'

  let subject = title
  let htmlContent = ''
  let textContent = ''

  switch (type) {
    case 'topic_approved':
      subject = `Your topic has been approved - ${siteName}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006EB6;">Topic Approved!</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your topic has been approved and is now published on the platform.</p>
          <div style="background-color: #f9fafb; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <p style="margin: 0;"><strong>${title}</strong></p>
            ${message ? `<p style="margin: 0.5rem 0 0 0;">${message}</p>` : ''}
          </div>
          <a href="${link}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">View Topic</a>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">You're receiving this because you have email notifications enabled.</p>
        </div>
      `
      textContent = `Hi ${userName},\n\nYour topic has been approved and is now published.\n\n${title}\n\n${message || ''}\n\nView topic: ${link}`
      break

    case 'topic_rejected':
      subject = `Topic review update - ${siteName}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Topic Review Update</h2>
          <p>Hi ${userName},</p>
          <p>Your topic has been reviewed. Unfortunately, it was not approved at this time.</p>
          <div style="background-color: #fef2f2; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>${title}</strong></p>
            ${message ? `<p style="margin: 0.5rem 0 0 0;">${message}</p>` : ''}
          </div>
          <a href="${link}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">Edit Topic</a>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">You're receiving this because you have email notifications enabled.</p>
        </div>
      `
      textContent = `Hi ${userName},\n\nYour topic was not approved.\n\n${title}\n\n${message || ''}\n\nEdit topic: ${link}`
      break

    case 'comment':
      subject = `New comment on your topic - ${siteName}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006EB6;">New Comment</h2>
          <p>Hi ${userName},</p>
          <p>${message}</p>
          <a href="${link}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">View Comment</a>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">You're receiving this because you have email notifications enabled.</p>
        </div>
      `
      textContent = `Hi ${userName},\n\n${message}\n\nView comment: ${link}`
      break

    case 'reply':
      subject = `New reply to your comment - ${siteName}`
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006EB6;">New Reply</h2>
          <p>Hi ${userName},</p>
          <p>${message}</p>
          <a href="${link}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">View Reply</a>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">You're receiving this because you have email notifications enabled.</p>
        </div>
      `
      textContent = `Hi ${userName},\n\n${message}\n\nView reply: ${link}`
      break

    default:
      subject = title || 'Notification from BYU-Idaho Education Platform'
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006EB6;">${title}</h2>
          <p>Hi ${userName},</p>
          ${message ? `<p>${message}</p>` : ''}
          ${link ? `<a href="${link}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">View Details</a>` : ''}
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">You're receiving this because you have email notifications enabled.</p>
        </div>
      `
      textContent = `Hi ${userName},\n\n${message || title}\n\n${link ? `View details: ${link}` : ''}`
  }

  return {
    subject,
    html: htmlContent,
    text: textContent,
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail, userName) {
  try {
    if (process.env.EMAIL_ENABLED !== 'true' || !userEmail) {
      return false
    }

    const transporter = createTransporter()
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const mailOptions = {
      from: `"BYU-Idaho Education Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Welcome to BYU-Idaho Education Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006EB6;">Welcome, ${userName}!</h2>
          <p>Thank you for joining the BYU-Idaho Education Platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Explore research topics and educational discussions</li>
            <li>Create and share your own topics</li>
            <li>Comment and engage with the community</li>
            <li>Bookmark topics for later reading</li>
          </ul>
          <a href="${siteUrl}" style="display: inline-block; background-color: #006EB6; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; margin: 1rem 0;">Get Started</a>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `,
      text: `Welcome, ${userName}!\n\nThank you for joining the BYU-Idaho Education Platform.\n\nGet started: ${siteUrl}`,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}



