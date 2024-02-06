// @ts-ignore
import './global' // 兼容某些情况下global报错的问题
import io from 'socket.io-client'
import { getConfig } from '@/ioc-visual/utils/config'

let htSocket: any
/**
 * https://socket.io/zh-CN/docs/v2/client-installation/
 * @returns
 */
const getHtSocket = () => {
  let { baseURL = '', publicPath = '/' } = getConfig()
  let { pathname = '/', host } = new URL(
    `${baseURL}/enterpriseadmin/ioc-server/ht`
  )

  if (import.meta.env.DEV) {
    host = '127.0.0.1:5999'
    pathname = ''
  }

  if (!htSocket) {
    htSocket = io(host, {
      serveClient: false,
      transports: ['websocket'],
      path: `${pathname}/socket.io`
    })
    htSocket.on('connect_error', (error: any) => {
      console.log('ht-server connect_error', error)
    })
  }

  return htSocket
}

let iocSocket: WebSocket
const getIocSocket = () => {
  let { baseURL = '' } = getConfig()
  let {
    protocol,
    host = '',
    pathname = '/'
  } = new URL(`${baseURL}/enterpriseadmin/ioc-server/ioc-server`)
  if (import.meta.env.DEV) {
    host = '127.0.0.1:5998'
    pathname = '/ioc-server'
  }
  let wsPath = `${protocol.replace('http', 'ws')}//${host}${pathname}/ws`
  if (!iocSocket || iocSocket?.CLOSING || iocSocket?.readyState === 3)
    iocSocket = new WebSocket(wsPath)
  return iocSocket
}

let iocSocketRef: any = null
const useIocSocket = (options?: { onopen?: any; onmessage?: any }) => {
  let { baseURL = '' } = getConfig()
  let {
    protocol,
    host = '',
    pathname = '/'
  } = new URL(`${baseURL}/enterpriseadmin/ioc-server/ioc-server`)
  if (import.meta.env.DEV) {
    host = '127.0.0.1:5998'
    pathname = '/ioc-server'
  }
  let wsPath = `${protocol.replace('http', 'ws')}//${host}${pathname}/ws`
  if (!iocSocketRef || iocSocketRef?.CLOSING || iocSocketRef?.readyState === 3)
    iocSocketRef = new WebSocket(wsPath)
  iocSocketRef.customClose = () => {
    iocSocketRef!.isCustomClose = true
    iocSocketRef?.close?.()
    iocSocketRef = null
  }
  iocSocketRef.onopen = (e) => options?.onopen?.(e)
  iocSocketRef.onmessage = (e) => options?.onmessage?.(e)
  iocSocketRef.onerror = () => {
    iocSocketRef = null
    reconnect()
  }
  iocSocketRef.onclose = () => {
    iocSocketRef = null
    reconnect()
  }

  const reconnect = () => {
    const sti: any = setInterval(() => {
      if (iocSocketRef) return clearInterval(sti)
      if (!iocSocketRef) useIocSocket(options)
    }, 3000)
  }

  return iocSocketRef
}

const getIocServerOrgin = () => {
  let { baseURL = '' } = getConfig()
  let res = `${baseURL}/enterpriseadmin/ioc-server`
  if (import.meta.env.DEV) res = 'http://127.0.0.1:5998'
  return res
}
function getQueryParams() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const params: any = {}

  for (const [key, value] of urlParams) {
    params[key] = value
  }

  return params
}

const parseIocServerProjectSourceUrl = (url: string) => {
  // console.log(getProjectInfo().id, '111111111111111', getQueryParams().projectId, 'id--------------')
  if (getQueryParams().projectId) {
    sessionStorage.setItem('projectId', getQueryParams().projectId)
    sessionStorage.setItem(
      'projectInfo',
      JSON.stringify({ id: getQueryParams().projectId })
    )
  }
  // const htSourceDir = ['scenes', 'models', 'symbols', 'components', 'displays', 'assets']

  // let flag = false
  // let res = '/' + url
  // const conver = () => {
  //   console.log(res, res.startsWith(`/${'displays'}/系统库`), 'res')
  //   // if(res.startsWith('/disp'))
  //   for (const item of htSourceDir) {
  //     if (res.startsWith(`/${item}/系统库`) == false) continue
  //     flag = true
  //     res = res.replace(`${item}/系统库`, `系统库/${item}`)
  //   }
  // }
  // conver()
  return url
  // console.log(url, '-------------')
  // if (flag) {
  //   return res
  // } else {
  //   return `${getIocServerOrgin()}/proj/${getProjectInfo().id || getQueryParams().projectId}/${url}`
  // }
  // if (url.indexOf('/系统库')) {
  //   let res = '/' + url
  //   for (const item of htSourceDir) {
  //     if (res.indexOf(`${item}/系统库`) < 0) continue
  //     res = res.replace(`${item}/系统库`, `系统库/${item}`)
  //   }
  //   return res
  // } else {
  //   return `${getIocServerOrgin()}/proj/${getProjectInfo().id || getQueryParams().projectId}/${url}`
  // }
}

export {
  getHtSocket,
  getIocSocket,
  getIocServerOrgin,
  parseIocServerProjectSourceUrl,
  useIocSocket
}
