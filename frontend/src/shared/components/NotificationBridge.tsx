import { useEffect } from 'react'
import { App } from 'antd'

import { setNotificationApi } from '../utils/notify'

export function NotificationBridge() {
    const { notification } = App.useApp()

    useEffect(() => {
        setNotificationApi(notification)
        return () => setNotificationApi(null)
    }, [notification])

    return null
}
