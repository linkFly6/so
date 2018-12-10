/**
 * url 参数解码
 * @param url 
 */
export const deserializeUrl = <T = object>(url: string) => {
  url = ~url.indexOf('?') ? url.split('?')[1] : url
  url = decodeURIComponent(url)
  const res: T = {} as any
  let tmp
  const params = url.split('#')[0].split('&')

  params.forEach(function (str: string) {
    tmp = str.split('=');
    // %3D:=，是否支持深度解码
    (res as any)[tmp[0]] = tmp[1]
  })
  return res
}

/**
 * 将一个对象序列化为 url（仅支持 1 级序列化，不支持多级）
 */
export const serializeUrl = (obj: object) => {
  return Object.keys(obj).reduce<string[]>((res, name) => {
    if ((obj as any)[name] != null) {
      res.push(encodeURIComponent(name) + '=' + encodeURIComponent((obj as any)[name]))
    }
    return res
  }, []).join('&')/*.replace(/%20/g, '+')*/
}
