/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:58:14
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-17 15:41:49
 * @Description: 导出文件
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
export default (data: any, options: any) => {
  data = data.map((item: string) => {
    const filterTarget = item.split('/')[0]
    return DAS_UTIL.urlPipeProject(item, filterTarget)
  })
  console.log(data)
  return data
}
