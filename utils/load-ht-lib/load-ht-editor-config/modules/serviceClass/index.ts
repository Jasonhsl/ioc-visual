/*
 * @Author:ChenWeidong
 * @Date: 2022-05-10 16:51:03
 * @LastEditors: ChenWeidong
 * @LastEditTime: 2022-05-11 10:24:02
 * @Description: dataPipe管道处理
 */

type Options = {
  systemArr?: Array<string>
  modelName?: Array<string>
}

type PipeHandler = (data: any, options: Options) => any

type HandlerMap = {
  [propName: string]: PipeHandler
}

const pathReg = /.*\/(.+)\.ts$/ // 匹配提取文件名
const handlerMap: HandlerMap = {}
const modules: any = import.meta.glob('./modules/*.ts', { eager: true })
Object.keys(modules).forEach((path: any) => {
  const key = path.match(pathReg)[1]
  handlerMap[key] = modules[path].default
})

export default async (
  cmd: string,
  data: any,
  options: Options
): Promise<HandlerMap> => {
  return await handlerMap[cmd](data, options)
}
