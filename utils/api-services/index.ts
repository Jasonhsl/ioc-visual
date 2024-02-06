// // 1.api-services注册服务
// const env = getEnv()
// export const platform = generater({})

// // 2.在业务吗模块注册api列表
// import {platform} from '@/ioc-visual/utils/api-services';

// const getUerInfo = platform.get('/user',(config)=>{
//   config.baseURL = XXX
// return config
// })
// const postUerInfo = platform.post('/user')
// const delUerInfo = platform.delte('/user')

// // 3.在业务页面调用api

// import {getUerInfo} from './api';

// getUerInfo(data)

import generator from './generator'
const version = 'v1'

export const PanelData = generator(`/api/device/${version}/`) // 修改面板数据
export const wsModelData = generator(`/ws/device/${version}/`) // 建立ws长链接
export const daslink = generator(`/api/daslink/${version}/`)
export const arbitrarilyUrl = generator('')
export const dasmaker = generator(`/api/dasmaker/${version}/`)
export const device = generator(`/api/device/${version}/`)
export const bems = generator(`/api/bems/${version}/`)
export const manager = generator(`/api/manager/${version}/`)
export const _ws = generator(`/ws/device/${version}/`) // 建立ws长链接
