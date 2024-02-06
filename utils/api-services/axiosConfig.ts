import axios from 'axios'
import dayjs from 'dayjs'

const instance = axios.create()

let REFRESHING_TOKEN = false // 正在刷新token
const refreshTokenTime = '' // 新token更新时间

// 更新token并重新请求
function reFreshTokenThenRequest() {
  REFRESHING_TOKEN = true
  return new Promise((resolve, reject) => {
    // getTokenByRefreshToken()
    //   .then((r: any) => {
    //     if (r.data.retCode === 0) {
    //       // 更新用户信息和过期时间
    //       dasTools.refreshUserInfo(r.data.data)
    //       console.log(r.data.data)
    //       dasTools.refreshExpireStamp(r.data.data.expiresIn)
    //       refreshTokenTime.value = new Date().getTime()
    //       // 重新发送当前请求
    //     } else {
    //       Message.error(r.data.message)
    //       setTimeout(() => {
    //         dasTools.logout()
    //       }, 3000)
    //     }
    //     resolve()
    //   })
    //   .catch((err: any) => {
    //     console.error(err)
    //     Message.warning('自动更新用户登录信息失败，请重新登录')
    //     setTimeout(() => {
    //       dasTools.logout()
    //     }, 3000)
    //     reject()
    //   })
    //   .finally(() => {
    //     REFRESHING_TOKEN = false
    //   })
  })
}

// 请求拦截
instance.interceptors.request
  .use
  // async (config) => {
  //   if (REFRESHING_TOKEN) {
  //     // 正在刷新token，等待新token返回
  //     return new Promise((resolve) => {
  //       const stopWatch = watch(refreshTokenTime, (newValue) => {
  //         console.log('newToken已更新')
  //         resolve(setRequestConfig(config))
  //       })
  //     })
  //   } else {
  //     // 判断当前时间是否过期，若过期则刷新token
  //     const expiresAt = Number(sessionStorage.getItem('expiresAt'))
  //     const nowMs = new Date().getTime()
  //     if (nowMs >= expiresAt) {
  //       try {
  //         console.log('等待token')
  //         await reFreshTokenThenRequest()
  //         console.log('token已返回')
  //       } catch (err) {
  //         console.error(err)
  //       }
  //     }

  //     return setRequestConfig(config)
  //   }
  // },
  // (err) => {
  //   return Promise.reject(err)
  // }
  ()
function getUserInfo() {
  const userInfoStr = window.sessionStorage.getItem('userInfo')
  const userInfo = userInfoStr && JSON.parse(userInfoStr)
  return userInfo || null
}
function checkIsClient() {
  const CLIENT_ROOT = 'AIOT_CLI'
  const path = window.location.pathname
  const pathReg = new RegExp(CLIENT_ROOT, 'i')
  const isClient = pathReg.test(path)
  return isClient
}
function getClientSelected() {
  const projInfo = window.sessionStorage.getItem('projectInfo')
  let proj: any = {}
  if (projInfo) {
    proj = JSON.parse(projInfo)
  }
  return proj
}
// 设置请求拦截
const setRequestConfig = (config: any) => {
  const language = 'zh-CN'

  config.headers.utcOffset = Number(dayjs().format('Z').replace(':00', ''))
  config.headers['Accept-Language'] = language
  if (
    config.url === 'http://192.168.100.154:8088/form/dataTemplate/v1/listJson'
  ) {
    return config
  } else {
    const userInfo = getUserInfo()
    const authorization = userInfo
      ? `${userInfo.tokenType} ${userInfo.accessToken}`
      : ''
    config.headers.Authorization = authorization
    config.headers['isClient'] = Number(checkIsClient())
    if (!config.headers['projectId'])
      config.headers['projectId'] = getClientSelected().id || ''
    return config
  }
}

export default instance
