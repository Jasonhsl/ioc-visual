import { getConfig } from '../getEnv'

// 系统资源
const htSourceDir = [
  'scenes',
  'models',
  'symbols',
  'components',
  'displays',
  'assets'
]

// 静态资源
const publicUrls = [
  'assets/images/3D.json',
  'assets/images/2D.json',
  'assets/images/2D3D.json',
  'assets/images/import.json',
  'assets/images/batch.json',
  'ht/custom/images/pipe.json',
  'ht/custom/images/pipe.json',
  'ht/custom/images/fullscreen.json'
]

const pureSystemUrl = (url: string): string => {
  if (!url.match('系统库')) return url
  let res = '/' + url
  for (const item of htSourceDir) {
    if (res.indexOf(`${item}/系统库`) < 0) continue
    res = res.replace(`${item}/系统库`, `系统库/${item}`)
  }
  return res
}
const convertURL = (url: string) => {
  const isPro = import.meta.env.PROD
  const isDev = import.meta.env.DEV
  if (!url) return { url, res: '' }
  let { publicPath, projectId = 'local', baseURL } = getConfig()
  let res = pureSystemUrl(url)
  // 远端资源
  const isRemoteUrl =
    /^data:image/.test(res) || /^http/.test(res) || /^https/.test(res)
  if (isRemoteUrl) return { url, res, isRemoteUrl }
  const isPublicUrl = !!publicUrls.find((item) => url.indexOf(item) > -1)
  // const isSystemUrl = res.match('系统库')
  const isSystemUrl = res.startsWith('/系统库')

  const isProjectUrl = !(isPublicUrl || isSystemUrl)
  if (isPublicUrl) {
    publicPath = `${baseURL}/enterpriseadmin/ioc-server`
    if (isDev) publicPath = ''
    res = `${publicPath}/${res}`
  }
  if (isSystemUrl) {
    publicPath = `${baseURL}/enterpriseadmin/ioc-server`
    if (isDev) publicPath = `http://127.0.0.1:5998`
    res = `${publicPath}/${res}`
  }
  // console.log(projectId, 'projectId------------11')

  if (isProjectUrl) {
    // console.log(projectId, 'projectId------------')
    if (!projectId || projectId === 'undefined') projectId = 'local'
    publicPath = `${baseURL}/enterpriseadmin/ioc-server/proj`
    if (isDev) publicPath = `http://127.0.0.1:5998/proj`
    res = `${publicPath}/${projectId}/${res}`
  }
  res = res
    .replace(/\/\//g, '/')
    .replace(/\/\//g, '/')
    .replace(/\/\//g, '/')
    .replace('http:/', 'http://')
    .replace('https:/', 'https://')
  return {
    isRemoteUrl,
    isSystemUrl,
    isProjectUrl,
    url,
    res
  }
}

const loadHtConfig = (config?: any) => {
  if (!config) config = {}
  window.htconfig = config
  return config
}

export { loadHtConfig, convertURL }
