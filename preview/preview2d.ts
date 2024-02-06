import { loadHtLib } from '../utils/load-ht-lib'
const preview = (option) => {
  loadHtLib().then(() => {
    const { url, json } = option
  })
  const mount = (id) => {
    const dom = document.getElementById(id)
  }
  return { mount }
}

export { preview }
