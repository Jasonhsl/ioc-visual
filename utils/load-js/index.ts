/** 使用promise加载js的工具 */
const loadJs = (src: string) => {
  const existingScript = document.getElementById(src)
  if (existingScript) return
  const script = document.createElement('script')
  if (import.meta.env.PROD) {
    if (src.startsWith('/')) src = `/${src}`
    src = src
      .replace(/\/\//g, '/')
      .replace(/\/\//g, '/')
      .replace('http:/', 'http://')
      .replace('https:/', 'https://')
  }
  script.src = src
  script.id = src
  document.body.appendChild(script)

  return new Promise((resolve, reject) => {
    script.onload = resolve
    script.onerror = reject
  })
}

export { loadJs }
