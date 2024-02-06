const loadHtEditorConfig = (options?: any) => {
  let config = { locale: 'zh' }
  // @ts-ignore
  Object.values(import.meta.glob('./modules/*.ts', { eager: true })).map(
    ({ default: getlocalConfig }) => {
      config = Object.assign(config, getlocalConfig(options))
    }
  )
  window.hteditor_config = config
  return config
}

export { loadHtEditorConfig }
