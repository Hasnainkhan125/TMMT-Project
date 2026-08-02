import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle, AlertCircle, FileText, User, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { getSocket } from '@/lib/socket'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'otp' | 'document_request' | 'application_update' | 'officer_message'
  message: string
  timestamp: Date
  title?: string
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
  applicationId?: string
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const socket = getSocket()

    const handleNotification = (payload: any) => {
      addNotification({
        id: Date.now().toString(),
        type: (payload?.type || 'info') as Notification['type'],
        message: payload?.message || 'New notification',
        timestamp: new Date(payload?.timestamp || Date.now()),
        title: payload?.title,
        actionUrl: payload?.actionUrl,
        priority: payload?.priority,
        applicationId: payload?.applicationId
      })
    }

    socket.on('notification', handleNotification)
    socket.on('document_request', (p: any) => handleNotification({ 
      type: 'document_request', 
      title: 'Documents Required', 
      message: p?.message || 'Additional documents have been requested for your application', 
      timestamp: new Date(), 
      id: Math.random().toString(36).slice(2),
      priority: 'high',
      actionUrl: `/user/dashboard`,
      applicationId: p?.applicationId
    }))
    socket.on('status_updated', (p:any)=> handleNotification({ 
      type: 'application_update', 
      title: 'Application Status Updated',
      message: p?.message || 'Your application status has been updated', 
      timestamp: new Date(), 
      id: Math.random().toString(36).slice(2),
      actionUrl: `/user/dashboard`,
      applicationId: p?.applicationId
    }))
    socket.on('amer_connected', () => handleNotification({ 
      type: 'officer_message', 
      title: 'Officer Connected',
      message: 'You are now connected to an Amer officer for live assistance.' 
    }))
    socket.on('new_message', (p: any) => handleNotification({ 
      type: 'officer_message', 
      title: 'New Message',
      message: p?.message || 'You have received a new message from an officer.',
      priority: 'medium'
    }))
    socket.on('file_upload_complete', () => handleNotification({ 
      type: 'success', 
      title: 'Upload Complete',
      message: 'Your documents have been uploaded successfully.' 
    }))

    return () => {
      socket.off('notification', handleNotification)
      socket.off('amer_connected')
      socket.off('new_message')
      socket.off('file_upload_complete')
    }
  }, [])

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-gradient-to-br from-black via-gray-900 to-black border border-[#B68A35]/30 rounded-lg shadow-lg overflow-hidden z-50 backdrop-blur-xl"
          >
            <div className="p-4 border-b border-[#B68A35]/30 bg-gradient-to-r from-[#B68A35]/10 to-[#00843D]/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-text-secondary">TAMMAT Notifications</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-white hover:bg-primary/90"
              >
                Mark all as read
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 border-b border-[#B68A35]/10 hover:bg-gradient-to-r hover:from-[#B68A35]/5 hover:to-[#00843D]/5 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        if (notification.actionUrl) {
                          navigate(notification.actionUrl)
                          setIsOpen(false)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 
                          notification.type === 'error' ? 'bg-red-500/20 text-red-400' : 
                          notification.type === 'document_request' ? 'bg-[#B68A35]/20 text-[#B68A35]' :
                          notification.type === 'application_update' ? 'bg-[#00843D]/20 text-[#00843D]' :
                          notification.type === 'officer_message' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-surface-light0/20 text-gray-400'
                        }`}>
                          {notification.type === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : notification.type === 'error' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : notification.type === 'document_request' ? (
                            <FileText className="w-4 h-4" />
                          ) : notification.type === 'application_update' ? (
                            <Bell className="w-4 h-4" />
                          ) : notification.type === 'officer_message' ? (
                            <MessageSquare className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            {notification.title && (
                              <h4 className="text-sm font-semibold text-white truncate">{notification.title}</h4>
                            )}
                            {notification.priority && (
                              <Badge 
                                variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                            {notification.actionUrl && (
                              <div className="flex items-center gap-1 text-xs text-[#00843D]">
                                <ExternalLink className="w-3 h-3" />
                                <span>View</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-[#B68A35]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-[#B68A35]" />
                    </div>
                    <p className="text-gray-400 text-sm">No new notifications</p>
                    <p className="text-gray-500 text-xs mt-1">You're all caught up!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter


