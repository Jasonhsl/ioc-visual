const getConfig = () => {
  const isDev = import.meta.env.DEV

  const config = {
    baseURL: '',
    proxyPrefix: '',
    htLibBaseURL: '',
    publicPath: '',
    projectId: '',
    token: ''
  }

  return { ...config }
}

export { getConfig }
