/*
 * @Author:ChenWeidong
 * @Date: 2022-05-10 17:04:27
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:25:56
 * @Description: 查询
 */

import DAS_UTIL from '@/ioc-visual/utils/index'
export default (data: any, options: any) => {
  const filterTarget = data.split('/')[1]
  return DAS_UTIL.urlPipeProject(data, filterTarget)
}
