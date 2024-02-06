/*
 * @Author: ChenWeidong
 * @Date: 2022-05-11 09:58:14
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-13 10:15:59
 * @Description: 粘贴文件
 */
import DAS_UTIL from '@/ioc-visual/utils/index'
export default (data: any, options: any) => {
  data.fileList = data.fileList.map((file: string) => {
    return DAS_UTIL.urlPipeProject(file)
  })
  return data
}
