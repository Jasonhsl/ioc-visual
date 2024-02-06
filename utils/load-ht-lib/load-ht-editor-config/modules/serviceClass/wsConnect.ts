/*
 * @Author: ChenWeidong
 * @Date: 2022-05-12 11:20:50
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-19 20:13:36
 * @Description: 新ws连接
 */
import { getIocServerOrgin, getIocSocket } from '../../../../get-socket'

export default (options?: any) => {
  const owner = options.owner
  const ws = getIocSocket()
  // 解决长时间不发送信息时,断开连接问题
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }))
  }, 50000)
  ws.onmessage = (e) => {
    window.dispatchEvent(
      new CustomEvent('onmessageWS', {
        detail: { data: e.data }
      })
    )
    try {
      const message = JSON.parse(e.data)
      messageHandler(message, owner)
    } catch (err) {
      console.error(err)
    }
  }
  return ws
}

// 消息处理
function messageHandler(message: any, owner: any) {
  const type = message[0] // 返回类型

  if (type == 'operationDone') {
    owner.handleRespone(+message[1], message[2])
  } else if (type == 'download') {
    const path = getIocServerOrgin() + message[1]
    window.location.href = path
  }
}
