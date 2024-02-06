/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:31:18
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:28:02
 * @Description: 上传文件
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
import https from '@/ioc-visual/utils/http'
import getEnv from '@/ioc-visual/utils/getEnv'
import JSZip from 'jszip'
import { show2 } from '@/views/ht/editor/hooks/useEditor'
import { isShow } from '@/views/ht/editor3d/hooks/useEditor'
const setRecord = https.dasmaker.post('/Maker/WriteLog')
const getNum = () => {
  return JSON.parse(sessionStorage.getItem('ioc-number') || '{}')
}
export default async (data: any, options: any) => {
  const base64Reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i // base64格式校验
  const zipReg = /\.zip$/i // zip文件校验

  const unzipBase64Zip = async (base64Zip: string) => {
    // 将 base64 字符串解码为二进制数据
    let content = base64Zip.replace(base64Reg, '')
    console.log(content, 'base64Zip')

    const zipData = atob(content)

    const len = zipData.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = zipData.charCodeAt(i)
    }

    const arrayBuffer = bytes.buffer
    const zip = new JSZip()
    // return new Promise(async (res) => {
    const data = await zip.loadAsync(arrayBuffer)

    // // 获取文件名数组
    let fileNames = Array.from(Object.keys(data.files))
    let end = /.json$/

    let arr = ['displays', 'scenes', '2D3D集成根目录']
    fileNames = fileNames.filter((item) => {
      if (item.indexOf(arr[0]) == 0 || item.indexOf(arr[1]) == 0 || item.indexOf(arr[2]) == 0) {
        return item
      }
    })
    let json = fileNames.filter((item) => end.test(item))
    console.log(fileNames, json)
    return json
  }
  // console.log(data, base64Reg.test(data.content), 'base64Reg.test(data.content)')
  const { totalNum, certificatesNumber } = getNum()
  if (base64Reg.test(data.content)) {
    if (zipReg.test(data.path)) {
      const jsonArr: any = await unzipBase64Zip(data.content)
      console.log(jsonArr)
      if (jsonArr.length + totalNum > certificatesNumber) {
        if (window.editor) {
          show2.value = true
          return false
        } else {
          isShow.value = true
          return true
        }
      }
    }
  } else {
    if (1 + totalNum > certificatesNumber) {
      if (window.editor) {
        show2.value = true
        return false
      } else {
        isShow.value = true
        return true
      }
    }
  }
  const uploadPathArr = data.path.split('/')
  for (let i = 0; i < options.systemArr.length; i++) {
    if (uploadPathArr[0] === options.systemArr[i] && uploadPathArr[1] === '系统库') {
      return 'systemNoPermission'
    }
  }
  const env = getEnv()
  if (uploadPathArr[0] == 'models' && uploadPathArr[uploadPathArr.length - 1].slice(-5) == '.json') {
    // 模型日志记录
    let operateType = '编辑'
    if (window._MODELT_CREATE) {
      operateType = '新增'
      delete window._MODELT_CREATE
    }
    const params = {
      operContent: `${operateType}【${uploadPathArr[uploadPathArr.length - 1].slice(0, -5)}】模型`, // 操作内容
      operType: operateType, // 操作类型
      operModule: '图形引擎', // 应用/模块
      portalName: '工作区', // 门户/功能
      projectId: env.projectId, // 项目id
      subMenu: '', // 二级菜单
    }
    setRecord(params)
  } else if (uploadPathArr[0] == '2D3D集成根目录' && window._2D3D_integrated_tag) {
    // 2D3D编辑器日志记录
    const params = {
      operContent: `新增【${uploadPathArr[uploadPathArr.length - 1].slice(0, -5)}】2D3D集成图纸`, // 操作内容
      operType: '新增', // 操作类型
      operModule: '图形引擎', // 应用/模块
      portalName: '工作区', // 门户/功能
      projectId: env.projectId, // 项目id
      subMenu: '', // 二级菜单
    }
    setRecord(params)
    delete window._2D3D_integrated_tag
  }

  const filterTarget = data.path.split('/')[0]
  data.path = DAS_UTIL.urlPipeProject(data.path, filterTarget)

  return data
}
