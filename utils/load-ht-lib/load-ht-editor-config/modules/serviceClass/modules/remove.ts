/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:40:22
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:27:36
 * @Description: 删除文件
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
import https from '@/ioc-visual/utils/http'
import getEnv from '@/ioc-visual/utils/getEnv'
const setRecord = https.dasmaker.post('/Maker/WriteLog')
export default (data: any, options: any) => {
  // 系统文件夹不允许操作
  const removePathArr = data.split('/')
  for (let i = 0; i < options.systemArr.length; i++) {
    if (removePathArr[0] === options.systemArr[i] && removePathArr[1] === '系统库') {
      return 'systemNoPermission'
    }
  }

  if (removePathArr[removePathArr.length - 1].slice(-5) == '.json') {
    // 删除文件日志记录
    const typeName = options.modelName[options.systemArr.indexOf(removePathArr[0])]
    const env = getEnv()
    const params = {
      operContent: `删除【${removePathArr[removePathArr.length - 1].slice(0, -5)}】${typeName}`, // 操作内容
      operType: '删除', // 操作类型
      operModule: '图形引擎', // 应用/模块
      portalName: '工作区', // 门户/功能
      projectId: env.projectId, // 项目id
      subMenu: '', // 二级菜单
    }
    setRecord(params)
  }
  const filterTarget = data.split('/')[0]
  return DAS_UTIL.urlPipeProject(data, filterTarget)
}
