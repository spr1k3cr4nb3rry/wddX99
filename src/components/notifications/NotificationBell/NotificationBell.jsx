import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { notificationsAPI } from '../../../services/api'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown'
import './NotificationBell.css'

function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const bellRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) return

    loadNotifications()
    loadUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount()
      if (showDropdown) {
        loadNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, showDropdown])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationsAPI.getAll({ unread_only: false, limit: 20 })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleBellClick = () => {
    if (!isAuthenticated) {
      navigate('/topics')
      return
    }
    setShowDropdown(!showDropdown)
    if (!showDropdown) {
      loadNotifications()
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationsAPI.markAsRead(notification.id)
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    if (notification.link) {
      navigate(notification.link)
      setShowDropdown(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="notification-bell-container">
      <button
        ref={bellRef}
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          ref={dropdownRef}
          notifications={notifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell



