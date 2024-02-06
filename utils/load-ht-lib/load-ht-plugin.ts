import { loadJs as _loadJs } from '../load-js'

const loadJs = (url: string, convertLibURL?: any) => {
  const res = convertLibURL?.(url) || url
  return _loadJs(res)
}

let init = false
const loadHtPlugin = async (convertLibURL?: any) => {
  if (init) return
  _loadJs('dataBinding/js/app.js')

  const htPlugins = [
    '/ht/libs/plugin/ht-animation.js',
    '/ht/libs/plugin/ht-autolayout.js',
    '/ht/libs/plugin/ht-contextmenu.js',
    '/ht/libs/plugin/ht-dialog.js',
    '/ht/libs/plugin/ht-edgetype.js',
    '/ht/libs/plugin/ht-flow.js',
    '/ht/libs/plugin/ht-form.js',
    '/ht/libs/plugin/ht-historymanager.js',
    '/ht/libs/plugin/ht-modeling.js',
    '/ht/libs/plugin/ht-obj.js',
    '/ht/libs/plugin/ht-overview.js',
    '/ht/libs/plugin/ht-vector.js',
    '/ht/libs/plugin/ht-forcelayout.js',
    '/ht/libs/plugin/heatmap2d.js',
    '/ht/libs/plugin/heatmap3d.js',
    '/ht/custom/libs/echarts.js'

    // '/ht/libs/plugin/ht-dashflow.js',
    // '/ht/libs/plugin/ht-astar.js',
    // '/ht/libs/plugin/ht-forcelayout.js',
    // '/ht/libs/plugin/ht-htmlnode.js',
    // '/ht/libs/plugin/ht-live.js',
    // '/ht/libs/plugin/ht-menu.js',
    // '/ht/libs/plugin/ht-palette.js',
    // '/ht/libs/plugin/ht-panel.js',
    // '/ht/libs/plugin/ht-propertypane.js',
    // '/ht/libs/plugin/ht-quickfinder.js',
    // '/ht/libs/plugin/ht-rulerframe.js',
    // '/ht/libs/plugin/ht-telecom.js',
    // '/ht/libs/plugin/ht-ui.js',
    // '/ht/libs/plugin/ht-webview3d.js',
    // '/ht/libs/plugin/ht-xeditinteractor.js',
  ]
  await loadJs('/ht/libs/plugin/ht-cssanimation.js', convertLibURL)
  await Promise.all(
    Object.values(htPlugins).map((item) => loadJs(item, convertLibURL))
  )
  await loadJs('/ht/custom/libs/echarts-gl.min.js')
  init = true
}

export { loadHtPlugin }
