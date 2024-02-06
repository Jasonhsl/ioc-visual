import { loadHtCore } from './load-ht-core'
import { loadHtPlugin } from './load-ht-plugin'
import { loadHtConfig, convertURL as defaultConvertURL } from './load-ht-config'
import { loadHtEditorConfig } from './load-ht-editor-config'
import { getConfig } from '../getEnv'

const defaultConvertLibURL = (url: string) => {
  const isDev = import.meta.env.DEV
  let { baseURL } = getConfig()
  baseURL += `/enterpriseadmin/ioc-server`
  if (isDev) baseURL = ''
  return `${baseURL}${url}`
}

const loadHt = async (convertLibURL?: any) => {
  await loadHtCore(convertLibURL)
  await loadHtPlugin(convertLibURL)
}

const loadHtLib = async (options?: {
  config?: any
  convertURL?: any
  convertLibURL?: any
}) => {
  let { config = {}, convertURL, convertLibURL } = options || {}
  if (!convertLibURL) convertLibURL = defaultConvertLibURL

  await loadHt(convertLibURL)

  if (convertURL) {
    window.ht.Default.convertURL = (url) => convertURL(defaultConvertURL(url))
  } else {
    window.ht.Default.convertURL = (url) => defaultConvertURL(url).res
  }

  loadHtConfig(config)
}

const loadHtEditor = async (options?: {
  config?: any
  editorConfig?: any
  convertURL?: any
  convertLibURL?: any
}) => {
  let {
    config = {},
    editorConfig = {},
    convertURL,
    convertLibURL
  } = options || {}
  if (!convertLibURL) convertLibURL = defaultConvertLibURL
  await loadHt(convertLibURL)

  loadHtConfig(config)
  if (convertURL) {
    window.ht.Default.convertURL = (url) => convertURL(defaultConvertURL(url))
  } else {
    window.ht.Default.convertURL = (url) => defaultConvertURL(url).res
  }
  loadHtEditorConfig(editorConfig)
}

const convertURL = (url: string) => defaultConvertURL(url).res

export { loadHtLib, loadHtEditor, convertURL }
