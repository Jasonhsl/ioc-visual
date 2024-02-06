import { loadJs as _loadJs } from '../load-js'
import { getConfig } from '../getEnv'

const loadJs = (url: string, convertLibURL?: any) => {
  const res = convertLibURL?.(url) || url
  return _loadJs(res)
}

const loadHtCore = async (convertLibURL?: any) => {
  let htAuthKey = '/ht-auth/key.js'
  let htAuthBuckle = '/ht-auth/buckle.js'
  if (import.meta.env.DEV) {
    htAuthKey = '/ht-auth-dev/key.js'
    htAuthBuckle = '/ht-auth-dev/buckle.js'
  }
  const env = getConfig()
  let { baseURL, proxyPrefix, htLibBaseURL } = env
  const isDev = import.meta.env.DEV

  let libBaseURL = baseURL + proxyPrefix + htLibBaseURL
  if (isDev) libBaseURL = `/ht`
  await loadJs('/mainAuth.js', convertLibURL)
  await loadJs('/ipauth.js', convertLibURL)
  await loadJs(htAuthKey, convertLibURL) // 在ht核心包之前加载key
  await loadJs('/ht/libs/core/ht.js', convertLibURL)
  await loadJs(htAuthBuckle, convertLibURL) // 在ht核心包之后加载buckle
  // await loadJs(libBaseURL + '/libs/plugin/ht-thermodynamic.js')
  await loadJs('/ht/libs/plugin/ht-thermodynamic.js', convertLibURL)
}

export { loadHtCore }
