const slice = Array.prototype.slice


export function leftPad(num: string | number, length: number, fill: string | number = '0') {
  const len = ('' + num).length
  return (Array(
    length > len ? length - len + 1 || 0 : 0,
  ).join(fill as string) + num)
}

/**
 * format(str,object) - 格式化一组字符串，参阅C# string.format()
 * @example format(str,object) - 通过对象格式化
 * @example format(str,Array) - 通过数组格式化
 * @param str - 格式化模板(字符串模板)
 * @param object - object - 使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
 * @param object - Array - 使用数组格式化，模板中使用${Index}占位：${0},${1}
 */
export const format = function (str: string, object: any): string {
  if (typeof str !== 'string') return ''
  const array = slice.call(arguments, 1)
  // 可以被\符转义
  return str.replace(/\\?\${([^{}]+)\}/gm, function (match, key) {
    // 匹配转义符"\"
    if (match.charAt(0) == '\\')
      return match.slice(1)
    const index = Number(key)
    if (index >= 0)
      return array[index]
    return object[key] !== undefined ? object[key] : match
  })
}


const rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
const rnoalphanumeric = /([^\#-~| |!])/g

/**
 * 将可能包含 HTML 文本修正为普通文本显示
 * 其实 server 用的是 lodash.escape 编码的
 * @param html 
 */
export const escapeHTML = (html: string) => {
  // 将字符串经过 str 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt  => 摘自avalon
  return String(html).
    replace(/&/g, '&amp;').
    replace(rsurrogate, function (value) {
      const hi = value.charCodeAt(0)
      const low = value.charCodeAt(1)
      return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
    }).
    replace(rnoalphanumeric, function (value) {
      return '&#' + value.charCodeAt(0) + ';'
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;')
}


/**
 * 修正 uri，例如 tasaid.com => http://tasaid.com
 * @param uri 
 */
export const resolveHTTPUri = (uri: string) => {
  if (uri.startsWith('//')) {
    return 'http:' + uri
  } else if (!/^http(?:s)?:\/\//.test(uri)) {
    return 'http://' + uri
  } else
    return uri
}


/**
 * 转换一个字节单位到合适阅读的单位
 * @param value 
 */
export const parseBit = (value: number) => {
  const radix = 1024
  let v: string = value as any;
  ['B', 'KB', 'MB', 'GB'].some((unitStr, i) => {
    if (value < Math.pow(radix, i + 1)) {
      v = (value / Math.pow(radix, i)).toFixed(2) + unitStr
      return true
    }
    return false
  })
  return v
}
