import axios from 'axios'
import dayjs from 'dayjs'
import generator from '../api-services/generator'
import { getProjectInfo } from '@/utils/common-info'
import { getConfig } from '@/ioc-visual/utils/config'

const PROJECT_ID_KEY = 'projectId'
const PROJECT_CODE_KEY = 'projectCode'
const QUERY_HOST_KEY = 'host'
const QUERY_USER_NAME = 'userName'
const SELECT_DEVICE_CODE = 'selectDeviceCode' // 获取选中的设备编码-用于在设备列表中跳转到平面图选中设备
const TOKEN_INFO = 'tokenInfo' // 用户信息，用于刷新token

const REFRESH_TOKEN_URL = `/api/connect/token` // 刷新token地址
const REFRESH_TOKEN_URL_BY_AUTH = `/api/manager/v1/Auth/NoSecretLogin` // 免密登录刷新token地址

let showMessageObj = undefined // 消息提示对象

const DAS_UTIL = {
  // 显示提示
  showMessage(message, type = 'success') {
    if (window.top !== window) {
      window.top.showMessage(type, message)
      return
    }
    if (!showMessageObj) {
      showMessageObj = {
        message: message, // 消息体
        type: type, // 类型
        timer: null // 定时器
      }
    }
    // 同一种类型的提示只弹一次
    if (
      showMessageObj.timer &&
      showMessageObj.type === type &&
      showMessageObj.message === message
    ) {
      return
    }
    // 显示消息提示
    const show = () => {
      popDivText.innerHTML = message
      popDiv.className = 'visible ' + type + '-pop'
      showMessageObj.timer = setTimeout(() => {
        popDiv.className = 'hidden ' + type + '-pop'
        clearTimeout(showMessageObj.timer)
        showMessageObj.timer = null
      }, 3000)
    }
    const popDiv = document.getElementById('dasmakerPopContent')
    const popDivText = document.getElementById('dasmakerPopContentText')
    if (popDiv) {
      popDiv.className = 'hidden ' + type + '-pop'
      if (showMessageObj.timer) {
        clearTimeout(showMessageObj.timer)
        showMessageObj.timer = null
        setTimeout(() => {
          show()
        }, 200)
      } else {
        show()
      }
    }
  },
  // 防抖函数
  debounce(fn, wait) {
    let timer
    return function () {
      clearTimeout(timer)
      timer = null
      timer = setTimeout(() => {
        fn()
      }, wait)
    }
  },
  // 获取开始时间
  getBeginTime(timeObj) {
    let beginDate = '',
      beginTime = '',
      nowDate = new Date()
    if (timeObj.isDateFixed) {
      beginDate = dayjs(timeObj.date)
    } else {
      const dateNum = timeObj.dateNum
      switch (timeObj.dateCycle) {
        case '4':
          // 日
          if (dateNum == 0) {
            beginDate = dayjs(nowDate).startOf('day')
          } else {
            beginDate = dayjs(nowDate).subtract(dateNum, 'day')
          }
          break
        case '5':
          // 月
          if (dateNum == 0) {
            beginDate = dayjs(nowDate).startOf('month')
          } else {
            beginDate = dayjs(nowDate).subtract(dateNum, 'month')
          }
          break
        case '6':
          // 年
          if (dateNum == 0) {
            beginDate = dayjs(nowDate).startOf('year')
          } else {
            beginDate = dayjs(nowDate).subtract(dateNum, 'year')
          }
          break
      }
    }
    timeObj.beginDate = beginDate
    if (timeObj.isTimeFixed) {
      beginTime = timeObj.time + ':00'
    } else {
      const timeArr = timeObj.timeNum.split(':')
      beginTime = dayjs(nowDate)
        .subtract(Number(timeArr[0]), 'hour')
        .subtract(Number(timeArr[1]), 'minute')
        .format('HH:mm:ss')
    }

    beginDate = beginDate.format('YYYY-MM-DD')
    return beginDate + ' ' + beginTime
  },

  // 获取结束时间
  getEndTime(timeObj, beginDate) {
    let endDate = '',
      endTime = '',
      nowDate = new Date(),
      startDate = beginDate

    if (timeObj.isDateFixed) {
      endDate = dayjs(timeObj.date)
    } else {
      switch (timeObj.dateCycle) {
        case '4':
          // 日
          endDate = dayjs(startDate).add(timeObj.dateNum, 'day')
          break
        case '5':
          // 月
          endDate = dayjs(startDate).add(timeObj.dateNum, 'month')
          break
        case '6':
          // 年
          endDate = dayjs(startDate).add(timeObj.dateNum, 'year')
          break
      }
    }
    if (timeObj.isTimeFixed) {
      endTime = timeObj.time + ':00'
    } else {
      const timeArr = timeObj.timeNum.split(':')
      endTime = dayjs(nowDate)
        .subtract(Number(timeArr[0]), 'hour')
        .subtract(Number(timeArr[1]), 'minute')
        .format('HH:mm:ss')
    }

    endDate = endDate.format('YYYY-MM-DD')

    let endDateStr = endDate + ' ' + endTime
    if (
      new Date(endDateStr) < new Date(beginDate) ||
      new Date(endDateStr) > new Date()
    ) {
      endDateStr = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }

    return endDateStr
  },
  // 切换时间格式
  changeDateType(nowDate, lastDate, dateType) {
    let str = ''
    switch (dateType) {
      case 0: // 秒
      case 1: // 分
      case 2: // 时
        let nowDay = nowDate.split(' ')[0]
        let lastDay = lastDate.split(' ')[0]
        if (nowDay != lastDay) {
          str = nowDate
        } else {
          str = nowDate.split(' ')[1]
        }
        break
      case 3: // 日
      case 4: // 月
        let nowYear = nowDate.split('/')[0]
        let lastYear = lastDate.split('/')[0]
        if (nowYear != lastYear) {
          str = nowDate
        } else {
          str = nowDate.slice(5)
        }
        break
      case 5: // 年
        str = nowDate
        break
    }
    return str
  },

  // 根据配置返回图表数据：
  /* data=websock返回数据，
    attr=key配置信息，
    type=类型：history=历史数据，model=模型数据 
    setDataDeal: 基本处理函数
    getPFunc： 属性p获取方法函数
    handleFuncType: 高级处理返回数据类型处理方法
    */
  setDeviceChartData(data, attr, type, setDataDeal, getPFunc, handleFuncType) {
    const info = attr.dataDealInfo.info
    try {
      if (info.bindType == 1) {
        // 序列数据；将各种格式的数据整合成统一格式
        const res = {
          headers: [],
          valueEntries: []
        }
        if (type === 'history') {
          res.headers = ['时间'].concat(data.header)
          const dateType = attr.dataSrcInfo.dataInfo.sampleCycle
          res.valueEntries = data.valueEntries.map((item, index) => {
            const arr = []
            if (index === 0) {
              arr.push(item.timeStr)
            } else {
              arr.push(
                DAS_UTIL.changeDateType(
                  item.timeStr,
                  data.valueEntries[index - 1].timeStr,
                  dateType
                )
              )
            }
            arr.push(...item.yValues)
            return arr
          })
        } else if (type === 'model') {
          res.headers = data.headers
          res.valueEntries = data.valueEntries
        } else if (type === 'operationalData') {
          res.headers = data.header
          res.valueEntries = data.resultSet
        }
        const arr = [res.headers, res.valueEntries]
        try {
          const func = info.func || 'function(arr){\n    return arr;\n}'
          const result = new Function('return ' + func)()(arr)
          res.headers = result[0]
          res.valueEntries = result[1]
        } catch (err) {
          console.error('序列函数报错：', err)
        }

        // console.log('整合后的数据====', res)

        switch (info.chartType) {
          case 'histogram':
          case 'lineChart':
          case 'barChart':
            const obj = {
              xData: [],
              seriesData: []
            }
            obj.xData = res.valueEntries.map((item) => {
              return item[info.firstOption]
            })
            info.secondOption.forEach((item) => {
              obj.seriesData.push({
                name: res.headers[item],
                data: res.valueEntries.map((ite) => {
                  return ite[item]
                })
              })
            })
            return obj
          case 'timeChart':
            break
          // 饼图
          case 'pieChart':
            const pieArr = []
            res.valueEntries.forEach((item) => {
              pieArr.push({
                name: item[info.firstOption],
                data: Number(item[info.secondOption])
              })
            })
            return pieArr
          // 列表
          case 'tableList':
            const tableObj = {
              columns: info.secondOption.map((item) => {
                return {
                  key: 'field' + item,
                  displayName: res.headers[item]
                }
              }),
              tableData: res.valueEntries.map((item) => {
                const obj = {}
                item.forEach((ite, index) => {
                  obj['field' + index] = ite
                })
                return obj
              })
            }
            return tableObj
          // 散点图
          case 'scatter':
            const scatterData = []
            info.secondOption.forEach((item, index) => {
              const obj = {
                name: res.headers[item],
                datas: []
              }
              res.valueEntries.forEach((ite) => {
                const group = [ite[info.firstOption], ite[item]] // 一组散点数据
                obj.datas.push(group)
              })
              scatterData.push(obj)
            })
            // console.log('散点数据====', scatterData)
            return scatterData
          // 雷达图
          case 'radar':
            const radarData = { indicator: [], datas: [] }
            radarData.indicator = info.secondOption.map(
              (item) => res.headers[item]
            )
            res.valueEntries.forEach((item) => {
              const obj = {
                name: item[0],
                data: info.secondOption.map((ite) => item[ite])
              }
              radarData.datas.push(obj)
            })
            // console.log('雷达图数据===', radarData)
            return radarData
          // 三维曲面图
          case 'surface':
            const surfaceData = res.valueEntries.map((item) => {
              const arr = []
              arr.push(item[info.firstOption])
              arr.push(item[info.secondOption])
              arr.push(item[info.thirdOption])
              return arr
            })
            return surfaceData
          // 盒须图
          case 'boxplot':
            const boxplotData = {
              names: [],
              datas: new Array(info.secondOption.length)
            }
            boxplotData.names = info.secondOption.map(
              (item) => res.headers[item]
            )
            boxplotData.datas.fill([])
            res.valueEntries.forEach((item) => {
              info.secondOption.forEach((ite, index) => {
                boxplotData.datas[index].push(item[ite])
              })
            })
            // console.log('盒须图数据====', boxplotData)
            return boxplotData
        }
      } else {
        // 单值数据
        const dataSetCellPosition = info.dataSetCellPosition
        let value = ''
        if (type === 'history') {
          // 设备历史数据
          if (dataSetCellPosition.columnIndex == 0) {
            value = data.valueEntries[dataSetCellPosition.rowIndex].xValue
          } else {
            value =
              data.valueEntries[dataSetCellPosition.rowIndex].yValues[
                dataSetCellPosition.columnIndex - 1
              ]
          }
        } else if (type === 'model') {
          // 设备模型数据
          const valArr = data.valueEntries[dataSetCellPosition.rowIndex]
          if (valArr) {
            value = valArr[dataSetCellPosition.columnIndex]
          }
        } else if (type === 'operationalData') {
          value =
            data.resultSet[dataSetCellPosition.rowIndex][
              dataSetCellPosition.columnIndex
            ]
        }

        if (info.type == 0) {
          return setDataDeal(value, info.dataDealArr)
        } else {
          let attrVal = ''
          let dasAttrVal = value
          const STORE_PROP_TYPE_KEY = '_HT_PROP_TYPE_'
          const STORE_BINDING_KEY = '_HT_BINDING_KEY_'
          const STORE_OLD_VAL_KEY = '_HT_OLD_VAL_'
          const STORE_NODE_KEY = '_HT_NODE_'
          const STORE_TYPE_KEY_P = 'p'
          const STORE_TYPE_KEY_A = 'a'
          const STORE_TYPE_KEY_S = 's'

          if (attr[STORE_PROP_TYPE_KEY] === STORE_TYPE_KEY_P) {
            attrVal =
              attr[STORE_NODE_KEY][getPFunc(attr[STORE_BINDING_KEY])]() ||
              attr[STORE_OLD_VAL_KEY] ||
              dasAttrVal
          } else if (attr[STORE_PROP_TYPE_KEY] === STORE_TYPE_KEY_A) {
            attrVal =
              attr[STORE_NODE_KEY].a(attr[STORE_BINDING_KEY]) ||
              attr[STORE_OLD_VAL_KEY] ||
              dasAttrVal
          } else if (attr[STORE_PROP_TYPE_KEY] === STORE_TYPE_KEY_S) {
            attrVal =
              attr[STORE_NODE_KEY].s(attr[STORE_BINDING_KEY]) ||
              attr[STORE_OLD_VAL_KEY] ||
              dasAttrVal
          }
          const das_func_value = new Function(
            'return ' + attr.dataDealInfo.info.func
          )()(dasAttrVal, attrVal)
          const returnType = attr.dataDealInfo.info.outputType
          return handleFuncType(das_func_value, returnType)
        }
      }
    } catch (err) {
      console.error('图表绑定报错', err)
    }
  },

  // 获取项目id
  getProjectName() {
    let prj = this.getQueryString(PROJECT_ID_KEY)
    if (!prj) prj = getProjectInfo().id
    if (!prj) prj = getConfig().projectId
    return prj
  },

  // 获取项目code
  getProjectCode() {
    let code = this.getQueryString(PROJECT_CODE_KEY)
    if (!code) code = getProjectInfo().id
    if (!code) code = getConfig().projectCode
    return code
  },

  // 获取username
  getUserName() {
    const userName = this.getQueryString(QUERY_USER_NAME)
    return userName
  },

  // 获取tokenInfo
  getTokenInfo() {
    const tokenInfo = this.getQueryString(TOKEN_INFO)
    sessionStorage.setItem('tokenInfo', tokenInfo)
    return tokenInfo
  },

  // 获取选中的设备编码-用于在设备列表中跳转到平面图选中设备
  getSelectDeviceCode() {
    const selectDeviceCode = this.getQueryString(SELECT_DEVICE_CODE)
    return selectDeviceCode || ''
  },

  // 返回refreshToken
  getRefreshToken() {
    const refreshToken = this.getQueryString(REFRESH_TOKEN)
    return refreshToken
  },

  // 获取userInfo
  getUserInfo() {
    const userInfo = JSON.parse(window.sessionStorage.getItem('userInfo'))
    return userInfo
  },

  // 登录
  async login() {
    let params = {
      userName: 'admin',
      password: '123456',
      isRetainLogin: false
    }
    const res = await axios.post(LOGIN_URL, params)
    if (res.data.retCode == 0) {
      window.sessionStorage.setItem('userInfo', JSON.stringify(res.data.data))
      return res.data.data
    } else {
      return false
    }
  },

  // 获取查询字段
  getQueryString(key) {
    var url = location.search || location.hash
    var theRequest = new Object()
    if (url.indexOf('?') != -1) {
      var str = url.split('?')[1]
      const strs = str.split('&')
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = strs[i]
          .split('=')
          .slice(1)
          .join('=')
      }
    }
    return theRequest[key]
  },

  // 过滤项目
  urlPipeProject(url, filterTarget = 'scenes') {
    let projectName = this.getProjectName()

    // const isDev = import.meta.env.MODE === 'development'
    // if (isDev) projectName = 'local'

    // 系统库调试
    /* if (url.includes("系统库")) {
            const arr = url.split("/");
            [arr[0], arr[1]] = [arr[1], arr[0]];
            return arr.join("/");
        } */

    const newUrl = url.indexOf('/') === 0 ? url.slice(1) : url
    url = `proj/${projectName}/${newUrl}`

    /* let fileReg = new RegExp(`^\/?${filterTarget}\/?(\\S*)`);
        const urlExec = fileReg.exec(newUrl)
        
        if (urlExec) {
            if(filterTarget === "scenes") {
                url = projectName ? `${filterTarget}/${projectName}/${urlExec[1]}` : `${filterTarget}/${urlExec[1]}` ;
            } else {
                url = `${filterTarget}/${urlExec[1]}`;
            }
        } */

    return url
  },

  removeProjectUrl(url, filterTarget = 'scenes') {
    const projectName = this.getProjectName()

    // 系统库调试
    /* if (url.includes("系统库")) {
            const arr = url.split("/");
            [arr[0], arr[1]] = [arr[1], arr[0]];
            return arr.join("/");
        } */

    if (projectName) {
      url = url.split(`proj/${projectName}/`).join('')
      /* const pathReg = new RegExp(`^\/?${filterTarget}\/${projectName}`);
            if( pathReg.test(url) ){
                if(filterTarget === "scenes" ) {
                    url = url.split(`${projectName}/`).join("");
                } else {
                    // 将项目id切换成“项目”
                    url = url.replace(projectName, "项目库");
                }
            } */
    }
    return url
  },

  addPrjIdToQuery(url) {
    const prjId = this.getQueryString(PROJECT_ID_KEY)
    const prjName = this.getProjectName()
    if (!prjId) {
      let pathArr = url.split('?')
      pathArr[1] += `${PROJECT_ID_KEY}=${prjName}&`
      url = pathArr.join('?')
    }
    return url
  },

  // 获取token
  getToken() {
    // 优先获取SessionStorage存的token，其次取userInfo中的token
    return new Promise((resolve, reject) => {
      const sessToken = window.sessionStorage.getItem('token')
      const userInfo = window.sessionStorage.getItem('userInfo')

      if (sessToken) {
        resolve(sessToken)
      } else if (userInfo) {
        const userInfoToken = JSON.parse(userInfo).accessToken
        window.sessionStorage.setItem('token', userInfoToken)
        resolve(userInfoToken)
      } else {
        resolve(null)
      }
    })
  },

  // 刷新token
  refreshTokenTimer() {
    window.dasmaker_refreshToken_timer = setInterval(async () => {
      await DAS_UTIL.refreshToken()
    }, 30 * 60 * 1000)
  },

  // 刷新token接口
  async refreshToken() {
    // 判断是否免密登录
    const authCode = this.getQueryString('authCode')
    if (!authCode) {
      let decodeTokenInfo = null
      let tokenInfo = this.getTokenInfo()
      if (tokenInfo.indexOf('%20') > -1) {
        tokenInfo = tokenInfo.replace(/\%20/g, '%2B')
      }

      tokenInfo = decodeURIComponent(tokenInfo)
      try {
        // 旧版本处理
        decodeTokenInfo = JSON.parse(tokenInfo)
      } catch (e) {
        // 新版本处理
        decodeTokenInfo = JSON.parse(
          decodeURIComponent(escape(window.atob(tokenInfo)))
        )
      }

      const objInfo = {
        client_id: 'AIoT',
        client_secret: '123456',
        grant_type: 'token',
        ...decodeTokenInfo
      }
      let str = ''
      for (const key in objInfo) {
        str += `&${key}=${objInfo[key]}`
      }
      str = str.slice(1)
      const [err, res] = await generator(REFRESH_TOKEN_URL, (config) => {
        config.headers['Content-type'] = 'application/x-www-form-urlencoded'
        return config
      }).post()({ data: str })
      if (err) return
      const access_token = res.access_token
      sessionStorage.setItem('token', access_token)
    } else {
      const params = JSON.parse(window.atob(decodeURIComponent(authCode)))
      const [err, res] = await generator(REFRESH_TOKEN_URL_BY_AUTH).post()({
        data: params
      })
      if (err) return
      const accessToken = res.data.accessToken
      sessionStorage.setItem('token', accessToken)
    }
  },

  // 判断是否是开发环境
  isDevEnv() {
    const host = window.location.hostname
    let isDev = false
    const gate = '172.168.80.*'
    const reg = new RegExp(`^localhost|127.0.0.1|${gate}`)
    if (reg.test(host)) {
      isDev = true
    }
    return isDev
  },

  // 获取请求host
  getApiHost() {
    const remainUrl = window.location.search
      .split('&')
      .find((item) => item.includes('remainUrl'))
    if (remainUrl && remainUrl.split('=')[1] !== '1') {
      // 本地调试
      return DAS_UTIL.getQueryString(QUERY_HOST_KEY)
    } else {
      // 生产环境
      return window.location.host
    }
  }
}

const UTIL = {
  getQueryString: (key) => {
    var url = location.search || location.hash
    var theRequest = new Object()
    if (url.indexOf('?') != -1) {
      var str = url.split('?')[1]
      const strs = str.split('&')
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = strs[i]
          .split('=')
          .slice(1)
          .join('=')
      }
    }
    return theRequest[key]
  },
  debounce: (fn, wait) => {
    let timer
    return function () {
      clearTimeout(timer)
      timer = null
      timer = setTimeout(() => {
        fn()
      }, wait)
    }
  },
  removeProjectUrl(url, filterTarget = 'scenes') {
    const projectName = UTIL.getProjectName()

    if (projectName) {
      url = url.split(`proj/${projectName}/`).join('')
    }
    return url
  },
  getProjectName() {
    let prj = UTIL.getQueryString(PROJECT_ID_KEY)

    return prj
  }
}

const CONFIG_PATH = '192.168.100.21:8082'
const queryHost = DAS_UTIL.getApiHost() || CONFIG_PATH

const API_ORIGIN = `${window.location.protocol}//${queryHost}`
const LOGIN_URL = `${API_ORIGIN}/api/manager/v1/Auth/Login` // 登录 地址

export default UTIL
