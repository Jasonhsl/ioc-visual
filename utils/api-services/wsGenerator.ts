// @ts-nocheck
let ws = null
let cb = null
import getEnv from '../getEnv'
const env = getEnv()
class MyWebSocket {
  constructor(url, cb, node) {
    this.url = url

    // close来源判断及后续操作
    this.closeConfig = {
      resolve: null,
      closing: false,
    }

    // 存放接口返回对象{ key: value }
    this.data = {}
    this.node = node

    this.cb = cb
  }

  setConfig(cb) {
    this.cb = cb
  }

  open() {
    return new Promise((resolve, reject) => {
      if (typeof this._websocket === 'undefined') {
        this._websocket = new WebSocket(this.url)
        this._websocket.onopen = (e) => {
          resolve({ e, ws: this })
        }
        this._websocket.onerror = (e) => {
          reject(e)
        }
      }
      this._websocket.onclose = (e) => {
        // 非主动close
        if (!this.closeConfig.closing) {
          console.log('reconnect')
          // 对应的重连操作
        }
        // 若手动close，回复初始状态
        this.closeConfig.closing = false
      }

      this._websocket.onmessage = (e) => {
        const msgItem = JSON.parse(e.data)
        // 查找匹配对象
        const key = msgItem.expression
        this.data[key].value = msgItem.value
        if (this.node) {
          try {
            // 获取数据绑定对象
            const data = this.node?.a('data')
            const dataKey = this.data[key].key
            if (data) {
              data[dataKey] = msgItem.value
              this.node?.a('data', data)
              if (this.cb) {
                this.cb(data, msgItem)
              }
              this.node?.iv()
            }
          } catch (error) {
            console.log(error)
          }
        } else {
          if (this.cb) {
            this.cb(msgItem)
          }
        }
      }
    })
  }

  close() {
    this.closeConfig.closing = true
    this._websocket.close()
  }

  // 发送数据
  send(dataInfo) {
    const param = {
      expression: `${dataInfo.devName}\\${dataInfo.paramName}`,
      expressionParamters: [
        {
          equipmentCode: dataInfo.devCode,
          equipmentName: dataInfo.devName,
          paramterCode: dataInfo.paramCode,
          paramterName: dataInfo.paramName,
        },
      ],
      projectCode: env.projectCode,
    }
    const expression = param.expression
    this.data[expression] = {
      key: dataInfo.paramCode,
      value: null,
    }
    delete param.paramCode
    // this.data[param.expression] = null

    this._websocket.send(JSON.stringify(param))
  }
}

const modelDataBinding = async (data) => {
  const node = data.data.panel
  let { baseURL } = getEnv()

  baseURL = baseURL.replace('https://', 'wss://').replace('http://', 'ws://') || ''

  if (location.protocol === 'https:') {
    baseURL = baseURL.replace('ws://', 'wss://')
  }

  const token = env.token || sessionStorage.getItem('token') || ''
  const url = baseURL + data.url + '?accesstoken=' + token
  cb = data.data.cb

  ws = new MyWebSocket(url, cb, node)
  await ws.open()
  return ws
}
export default modelDataBinding
