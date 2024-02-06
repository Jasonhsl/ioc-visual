/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:58:14
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:27:01
 * @Description: 新建文件夹
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
export default (data: any, options: any) => {
  // 系统文件夹不允许操作
  for (let i = 0; i < options.systemArr.length; i++) {
    const pathArr = data.split('/')
    if (pathArr[0] === options.systemArr[i] && pathArr[1] === '系统库') {
      return 'systemNoPermission'
    }
  }
  const filterTarget = data.split('/')[0]
  return DAS_UTIL.urlPipeProject(data, filterTarget)
}
