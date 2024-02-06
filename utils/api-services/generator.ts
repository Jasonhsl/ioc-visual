// @ts-nocheck
import axios from './axiosConfig'
import curringHttp from './curring'
function onSuccess(response: any) {
  if (response.config?.responseType === 'blob') return response
  const res = [null, response.data || response]
  return res
}

function onError(error: any) {
  // 错误类型：1.http状态码不是2xx；2.取消请求或请求配置异常；3.断网
  if (error.response) {
    // 对应错误类型1
    const status = error.response.status
    const messageMap: any = {
      400: '参数校验错误',
      401: '用户认证失败，请重新登陆',
      403: '授权失败，您没有相关权限',
      404: '接口地址未找到',
      500: '服务器内部错误',
    }
    const message = error.response.message || error.response.data?.message
    console.log(message || messageMap[status] || '请求失败')

    if (status === 401) {
      // mvue.$dtools.logout()
    }
  } else if (error.request) {
    // 请求已发出，但是没有响应，视为断网，对应错误类型3
    console.log('网络异常，请检查您的网络情况')
  } else {
    // 对应错误类型2
    console.log('请求被取消')
  }
  // 最后返回错误，阻塞代码，并可供业务自行处理
  return Promise.reject(error.response || error)
}

/**
 * @description 对config配置的回调处理
 * @callback configCallback
 * @param {Object} config 请求配置
 */

/**
 * - 请求模块生成器
 * @param {string} url - 请求地址
 * @param {configCallback} customConfig - 请求配置处理方法
 * @description 请求模块生成器
 */
export default (url: string, customConfig = () => {}) => {
  return curringHttp(axios, (config) => {
    config.baseURL = config.baseURL + url //url:/api/manager/${version}
    config.onSuccess = onSuccess
    config.onError = onError
    return customConfig(config) || config
  })
}
