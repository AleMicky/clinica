import { notification } from 'antd'

export const notify = {
  error: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.error({
      key,
      title: message,
      description,
    }),

  success: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.success({
      key,
      title: message,
      description,
    }),

  warning: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.warning({
      key,
      title: message,
      description,
    }),

  info: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.info({
      key,
      title: message,
      description,
    }),
}