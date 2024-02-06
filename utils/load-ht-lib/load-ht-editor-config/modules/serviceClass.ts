import UTIL from '../../../toolUtils'
import { getConfig } from '../../../getEnv.ts'
import dataPipe from './serviceClass/index.ts'

import creatWs from './serviceClass/wsConnect'
import { getHtSocket } from '../../../get-socket'

const systemArr: Array<string> = [
  'displays',
  'scenes',
  'symbols',
  'components',
  'models',
  'assets',
  '2D3D集成根目录'
]
const modelName: Array<string> = [
  '图纸',
  '场景',
  '图标',
  '组件',
  '模型',
  '资源',
  '2D3D集成图纸'
]

const cmdArr: Array<string> = ['explore', 'paste', 'export', 'upload'] // 重新代理后台服务

function isString(o) {
  return typeof o === 'string' || o instanceof String
}

// 解析图纸层级
function analyseTree(treeNode, parentPath) {
  for (let key in treeNode) {
    if (typeof treeNode[key] == 'boolean') {
      if (key.includes('.json')) {
        // 图纸
        treeNode[key] = {
          fileType: '2d3d',
          fileImage: 'assets/images/2D3D.json',
          styles: {
            label: key.slice(0, key.lastIndexOf('.json'))
          }
        }
      }
    } else {
      analyseTree(treeNode[key], parentPath + '/' + key)
    }
  }
}

class CustomSocketService {
  constructor(handler, editor) {
    window.websocketIO = this

    this.editor = editor
    this.handler = handler
    this.cookie = 0
    this.callbacks = {}
    this.cmds = {}

    const show2d3dTag = UTIL.getQueryString('show2d3d')
    if (show2d3dTag == 'true') {
      // 2d3d集成请求
      this._2d3dRequest = UTIL.debounce(function () {
        window.websocketIO.request(
          'explore',
          '2D3D集成根目录',
          function (data) {
            analyseTree(data, '2D3D集成根目录')
            window._2d_3d_editorExpler.parse(data)
          }
        )
      }, 100)
    }

    const env = getConfig()
    // socket连接

    const url = env.baseURL

    this.socket = getHtSocket()

    // 新ws连接，主要用于explore/export/upload/paste接口重置
    // let newUrl = env.baseURL.split('//')[1] + (env.htBaseURL || '')
    let newUrl = env.baseURL.split('//')[1]

    this.newSocket = creatWs({ url: newUrl + '/', owner: this })

    this.socket.on('connect', () => {
      this.handler({
        type: 'connected',
        message: url
      })
    })
    this.socket.on('disconnect', () => {
      this.handler({
        type: 'disconnected',
        message: url
      })
    })
    this.socket.on('fileChanged', (data) => {
      // remove project name from poth
      if (data.event === 'change' || 'rename') {
        const filterTarget = data.path.split('/')[0]
        data.path = UTIL.removeProjectUrl(data.path, filterTarget)
      }
      console.log(data.path)
      if (data.path.indexOf('2D3D集成根目录') >= 0) {
        // 2D3D集成环境发生变化
        const show2d3dTag = UTIL.getQueryString('show2d3d')
        if (show2d3dTag == 'true') {
          window.websocketIO._2d3dRequest()
        }
      }

      this.handler({
        type: 'fileChanged',
        path: data.path,
        event: data.event
      })
    })
    this.socket.on('importError', (data) => {
      console.log('导入失败，', data)
      var x = new hteditor.MessageView(document.body)
      x.show('文件导入失败~', 'error')
      if (data && data.event === 'importError') {
        const failDiv = document.getElementById('uploadFail')
        if (failDiv) {
          const fileBox = document.getElementById('file-box')
          const tips = document.getElementById('tips')
          failDiv.style.display = 'flex'
          fileBox.style.display = 'none'
          tips.innerHTML = '上传失败，无法解析该zip文件'
        }
      }
    })
    this.socket.on('importSuccess', (data) => {
      var x = new hteditor.MessageView(document.body)
      x.show('文件导入成功~')
    })
    this.socket.on('operationDone', (cookie, data) => {
      this.handleRespone(cookie, data)
    })
    this.socket.on('download', (path) => {
      console.log(path)
      const finalPath = window.location.port == '' ? 'maker' + path : path
      this.handler({
        type: 'download',
        path: finalPath
      })
    })
    this.socket.on('confirm', (path, datas) => {
      this.handler({
        type: 'confirm',
        path: path,
        datas: datas
      })
    })
  }
  async request(cmd, data, callback) {
    data = await dataPipe(cmd, data, { systemArr, modelName })

    if (data === 'systemNoPermission') {
      var x = new hteditor.MessageView(document.body)
      x.show('系统文件不可修改', 'error')
      return
    }

    const cookie = ++this.cookie
    this.callbacks[cookie] = callback
    this.cmds[cookie] = {
      cmd: cmd,
      param: data
    }

    var sid = this.editor.sid
    if (cmdArr.includes(cmd)) {
      const query = [cmd, cookie, data]
      // console.log(this.newSocket, '------------')
      if (this.newSocket.readyState !== 1) {
        const sti = setInterval(() => {
          if (this.newSocket.readyState === 1) {
            clearInterval(sti)
            this.newSocket.send(JSON.stringify(query))
          }
        }, 10)
      } else {
        this.newSocket.send(JSON.stringify(query))
      }
      // // setTimeout(() => {
      // this.newSocket.send(JSON.stringify(query))
      // // }, 500)
    } else {
      this.socket.emit(
        cmd,
        cookie,
        data,
        sid
          ? {
              sid: sid
            }
          : null
      )
    }

    // console.log(cmd, cookie, data, sid,)

    let message = cmd
    if (data) {
      if (isString(data)) {
        message = cmd + ': ' + data
      } else if (data.path) {
        message = cmd + ': ' + data.path
      }
    }
    this.handler({
      type: 'request',
      message,
      cmd,
      data
    })
  }

  handleRespone(cookie, data) {
    const callback = this.callbacks[cookie]
    const cmd = this.cmds[cookie]['cmd']

    const param = this.cmds[cookie]['param']

    delete this.callbacks[cookie]
    delete this.cmds[cookie]

    if (callback) callback(data)
    this.handler({
      type: 'response',
      message: cmd,
      cmd,
      data
    })
  }
}

export default (options?: any) => {
  return {
    serviceClass: CustomSocketService
  }
}
