import { debounce } from 'lodash'
import { parseData } from './object'


const localStorage = window.localStorage

/**
 * local storage 存储
 */
/**
 * local storage 存储
 */
export class Store<T = any> {
  private _namespace: string
  /**
   * 指定一个命名空间存储数据 (LocalStorage)
   * @param namespace 
   */
  constructor(namespace?: string) {
    // 修正命名空间
    if (namespace && namespace.charAt(namespace.length - 1) !== '.') {
      namespace += '.'
    }
    this._namespace = namespace || ''
  }

  public getKey(key: keyof T) {
    return this._namespace + key
  }

  /**
   * 设置数据
   * @param key 
   * @param value 
   */
  public get<K extends keyof T>(key: K): T[K] | null {
    try {
      return parseData(localStorage.getItem(this.getKey(key)))
    } catch (e) {
      return null
    }
  }

  public set<K extends keyof T>(key: K | { [N in keyof T]?: T[N] }, value?: T[K]) {
    if (typeof key === 'object') {
      // set
      Object.keys(key).forEach(name => {
        this.set(name as any, (key as any)[name])
      })
      return this
    }
    // set
    let objectType
    if (arguments.length > 1) {
      // set
      objectType = Array.isArray(value) || typeof value === 'object'
      try {
        localStorage.setItem(
          this.getKey(key),
          objectType ? JSON.stringify(value) : value as any)
      } catch (e) {
        // safari 隐私模式
      }
      return this
    }

  }

  /**
   * 获取该 Store 所有的 key
   * @param [noTrimNamespace=false] 是否保留命名空间(保留命名空间前缀)，如果保留前缀则是 localStorage 中真实存储的 key
   */
  public getAllKey(noTrimNamespace = false): Array<(keyof T)> {
    const nameSpace = this._namespace
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i) as string
      if (name.startsWith(nameSpace)) {
        keys.push(noTrimNamespace ? name : name.substring(nameSpace.length))
      }
    }
    return keys as any
  }

  /**
   * 检查是否存在某个 key
   * @param key 
   */
  public has(key: keyof T) {
    try {
      return localStorage[this.getKey(key)] !== undefined
    } catch (error) {
      return false
    }
  }

  /**
   * 删除指定 key 的数据
   * @param key 
   */
  public delete(key: keyof T) {
    try {
      return localStorage.removeItem(this.getKey(key))
    } catch (error) {
      // empty
    }
  }

  /**
   * 清空这个 Store 命名空间下的数据，返回被清除的数据
   */
  public clear(): T {
    const res: T = {} as any
    this.getAllKey().forEach(key => {
      const localKey = this.getKey(key as any)
      try {
        res[key] = parseData(localStorage[localKey])
        localStorage.removeItem(localKey)
      } catch (error) {
        // no empty
      }
    })
    return res
  }
}


/**
 * 获取 cookie
 * @param name 
 */
export const getCookie = (name?: string) => {
  const result: object | null = name ? null : {}
  const cookies = document.cookie ? document.cookie.split('; ') : []
  let i = 0
  const length = cookies.length
  let parts
  let key
  let cookie
  for (; i < length; i++) {
    parts = cookies[i].split('=')
    key = decodeURIComponent(parts.shift())
    cookie = decodeURIComponent(parts.join('='))
    if (key && key === name) return parseData(cookie)
    if (!name && cookie) (result as any)![key] = cookie
  }
  return result == null ? '' : result
}


/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value 值
 * @param expiredays 过期时间(天)
 * @param path 
 * @param domain 
 */
export const setCookie = (name: string, value: any, expiredays?: number, path?: string, domain?: string) => {
  const exdate = new Date()
  if (expiredays != null) {
    exdate.setTime(exdate.getTime() + expiredays * 8.64e7)
    // 目前 UTC 已经取代 GMT 作为新的世界时间标准，使用toGMTString()和toUTCString()两种方法返回字符串的格式和内容均相同
  } else {
    // 默认设个 10 年的
    exdate.setFullYear(exdate.getFullYear() + 10)
  }
  const expiredayStr = ';expires=' + exdate.toUTCString()
  if (typeof value === 'object' || Array.isArray(value)) {
    value = JSON.stringify(value)
  }
  path = path || '/'
  domain = domain == null ? document.domain : domain
  document.cookie = [name, '=', encodeURIComponent(value), expiredayStr, ';path=', path, ';domain=', domain].join('')
}



/**
 * 工厂方法：创建一个对象，对象返回 store 和一个保存函数，保存函数具有以下特点：
 * 1. 保存到 Store 根据指定的 timer 进行函数节流
 * 2. 保存数据是 mixin 模式，而不是直接覆盖
 * @param namespace store 命名空间
 * @param key 在 store 中要保存的 key
 * @param [timer=300] 函数节流时间阈
 */
export const createFactoryStoreSave = <T = any>(namespace: string, key: keyof T, timer = 300) => {
  const store = new Store<T>(namespace)
  let data = store.get(key) || {} as any
  return {
    /**
     * store 对象
     */
    store,
    /**
     * 保存函数，函数节流和 mixin 保存
     */
    save: debounce((value: T) => {
      data = { ...data, ...value as any }
      store.set(key, data)
    }, timer),
  }
}
