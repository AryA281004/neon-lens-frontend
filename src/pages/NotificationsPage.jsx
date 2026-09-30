import React from 'react'
import NotificationsPanel from '../components/NotificationsPanel'

const NotificationsPage = () => {
  return (
    <div className="min-h-[calc(100vh-3rem)] w-full px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <NotificationsPanel />
      </div>
    </div>
  )
}

export default NotificationsPage
