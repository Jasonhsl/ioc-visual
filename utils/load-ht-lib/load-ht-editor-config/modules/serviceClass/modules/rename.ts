/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:58:14
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:27:49
 * @Description: 文件重命名
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
export default (data: any, options: any) => {
  // 系统文件夹不允许操作
  for (let i = 0; i < options.systemArr.length; i++) {
    const oldPathArr = data.old.split('/')
    const newPathArr = data.new.split('/')
    if ((oldPathArr[0] === options.systemArr[i] && oldPathArr[1] === '系统库') || (newPathArr[0] === options.systemArr[i] && newPathArr[1] === '系统库')) {
      return 'systemNoPermission'
    }
  }
  const filterTarget = data.old.split('/')[0]
  data.old = DAS_UTIL.urlPipeProject(data.old, filterTarget)
  data.new = DAS_UTIL.urlPipeProject(data.new, filterTarget)
  return data
}
