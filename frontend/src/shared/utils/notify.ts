import type { NotificationInstance } from 'antd/es/notification/interface'

let notificationApi: NotificationInstance | null = null

export function setNotificationApi(api: NotificationInstance | null) {
    notificationApi = api
}

function show(
    type: 'error' | 'success' | 'warning' | 'info',
    message: string,
    description?: string,
    key?: string,
) {
    notificationApi?.[type]({
        key,
        title: message,
        description,
    })
}

export const notify = {
    error: (message: string, description?: string, key?: string) =>
        show('error', message, description, key),

    success: (message: string, description?: string, key?: string) =>
        show('success', message, description, key),

    warning: (message: string, description?: string, key?: string) =>
        show('warning', message, description, key),

    info: (message: string, description?: string, key?: string) =>
        show('info', message, description, key),
}
