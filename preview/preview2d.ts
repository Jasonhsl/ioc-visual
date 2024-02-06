import { loadHtLib } from '../utils/load-ht-lib'
import startPage from './main'
import type { Option } from './type'

const preview = (option: Option) => {
  loadHtLib().then(() => {
    const { url } = option
    console.log(url)
    startPage(url)
  })
  const mount = (id) => {
    const dom = document.getElementById(id)
    if (!dom) return

    dom.innerHTML = '123'
  }
  return { mount }
}

export { preview }
