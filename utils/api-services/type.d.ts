import type { AxiosInstance, AxiosRequestConfig } from 'axios'
type UnionToIntersection<U> = (U extends U ? (x: U) => unknown : never) extends (x: infer R) => unknown ? R : never
/**
 * 配置项
 */
export type CurringConfig = AxiosRequestConfig & {
  axiosInstance?: AxiosInstance
  urlPrefix?: string
  onSuccess?: any
  onError?: any
  axios?: any
  onCustomError?: any
  finally?: any
  method: Method
}
export type Method = 'get' | 'post' | 'put' | 'delete' | 'ws' | 'patch'
export type Payload = {
  data?: any
  params?: any
  onSuccess?: any
  onError?: any
  onCustomError?: any
}
export type CurringConfigFun = (config: CurringConfig) => CurringConfig

export type CurringApi = (url: string, config?: CurringConfig) => CurringRequest
export type CurringRequestAsync = (payload: string | object | any[], config?: CurringConfig) => Promise<[err: null | object, data: object]>
export type CurringRequest = (payload: string | object | any[], config?: CurringConfig) => [err: object | null, data: object | null, run: () => any]
