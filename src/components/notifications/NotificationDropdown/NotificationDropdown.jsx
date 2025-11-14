import React, { forwardRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import './NotificationDropdown.css'

const NotificationDropdown = forwardRef(({
  notifications,
  loading,
  onNotificationClick,
  onMarkAllAsRead,
  onDelete,
  onClose
}, ref) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'topic_approved':
        return '✓'
      case 'topic_rejected':
        return '✗'
      case 'comment':
        return '💬'
      case 'reply':
        return '↩'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'topic_approved':
        return '#10b981'
      case 'topic_rejected':
        return '#ef4444'
      case 'comment':
        return '#3b82f6'
      case 'reply':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  return (
    <div ref={ref} className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && notifications.some(n => !n.read) && (
          <button onClick={onMarkAllAsRead} className="btn-mark-all-read">
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-dropdown-content">
        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="notification-icon" style={{ backgroundColor: getNotificationColor(notification.type) + '20', color: getNotificationColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  {notification.message && (
                    <div className="notification-message">{notification.message}</div>
                  )}
                  <div className="notification-time">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <span className="notification-dot"></span>
                  )}
                  <button
                    onClick={(e) => onDelete(notification.id, e)}
                    className="btn-delete-notification"
                    aria-label="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-dropdown-footer">
          <button onClick={onClose} className="btn-close-notifications">
            Close
          </button>
        </div>
      )}
    </div>
  )
})

NotificationDropdown.displayName = 'NotificationDropdown'

export default NotificationDropdown



