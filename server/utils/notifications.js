import pool from '../config/database.js'
import { sendEmailNotification } from './email.js'

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @param {number} notificationData.userId - User ID to notify
 * @param {string} notificationData.type - Notification type (topic_approved, topic_rejected, comment, reply, etc.)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.link - URL to related content
 * @param {number} notificationData.relatedId - ID of related entity
 * @param {string} notificationData.relatedType - Type of related entity (topic, comment, user, etc.)
 */
export async function createNotification(notificationData) {
  try {
    const { userId, type, title, message, link, relatedId, relatedType } = notificationData

    if (!userId || !type || !title) {
      console.error('Missing required notification fields:', notificationData)
      return null
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link, related_id, related_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [userId, type, title, message || null, link || null, relatedId || null, relatedType || null]
    )

    // Send email notification if user has email notifications enabled
    try {
      const userResult = await pool.query(
        'SELECT email, name, notification_preferences FROM users WHERE id = $1',
        [userId]
      )
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0]
        const preferences = user.notification_preferences || { email: true, in_app: true }
        
        if (preferences.email !== false && user.email) {
          // Send email asynchronously (don't wait for it)
          sendEmailNotification(user.email, user.name, {
            type,
            title,
            message,
            link,
          }).catch(err => {
            console.error('Failed to send email notification:', err)
          })
        }
      }
    } catch (emailError) {
      // Don't fail notification creation if email fails
      console.error('Error checking email preferences:', emailError)
    }

    return result.rows[0].id
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Create notification for topic approval
 */
export async function notifyTopicApproved(userId, topicId, topicTitle) {
  return createNotification({
    userId,
    type: 'topic_approved',
    title: 'Topic Approved',
    message: `Your topic "${topicTitle}" has been approved and published.`,
    link: `/topic/${topicId}`,
    relatedId: topicId,
    relatedType: 'topic'
  })
}

/**
 * Create notification for topic rejection
 */
export async function notifyTopicRejected(userId, topicId, topicTitle, reason = null) {
  return createNotification({
    userId,
    type: 'topic_rejected',
    title: 'Topic Rejected',
    message: reason 
      ? `Your topic "${topicTitle}" has been rejected. Reason: ${reason}`
      : `Your topic "${topicTitle}" has been rejected.`,
    link: `/topics/edit/${topicId}`,
    relatedId: topicId,
    relatedType: 'topic'
  })
}

/**
 * Create notification for new comment on user's topic
 */
export async function notifyNewComment(userId, topicId, topicTitle, commentAuthor, commentId) {
  return createNotification({
    userId,
    type: 'comment',
    title: 'New Comment',
    message: `${commentAuthor} commented on your topic "${topicTitle}".`,
    link: `/topic/${topicId}#comment-${commentId}`,
    relatedId: commentId,
    relatedType: 'comment'
  })
}

/**
 * Create notification for reply to user's comment
 */
export async function notifyReply(userId, topicId, topicTitle, replyAuthor, replyId) {
  return createNotification({
    userId,
    type: 'reply',
    title: 'New Reply',
    message: `${replyAuthor} replied to your comment on "${topicTitle}".`,
    link: `/topic/${topicId}#comment-${replyId}`,
    relatedId: replyId,
    relatedType: 'comment'
  })
}

