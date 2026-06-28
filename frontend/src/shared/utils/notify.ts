import { notification } from 'antd'

export const notify = {
  error: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.error({
      key,
      message,
      description,
    }),

  success: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.success({
      key,
      message,
      description,
    }),

  warning: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.warning({
      key,
      message,
      description,
    }),

  info: (
    message: string,
    description?: string,
    key?: string,
  ) =>
    notification.info({
      key,
      message,
      description,
    }),
}