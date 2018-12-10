/**
 * 判断是否为空对象 => {}
 * @param obj 
 */
export const isEmptyObject = (obj: any) => {
  return !Object.keys(obj).length
}

/**
 * 对比 traget 和 obj，target 所有包含的属性和 obj 是否对等
 * 主要根据 target 的属性进行对比；而 obj 有， target 没有的属性不影响对比
 * @param target 
 * @param obj 
 */
export const targetDiffInObj = (target: object, obj: object) => {
  return Object.keys(target).every(key => {
    return (target as any)[key] === (obj as any)[key]
  })
}

const rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/ // 检测是否是json对象格式

/**
 * 将一个字符串转换为对象(object)
 * @param value 
 */
export function parseData<T>(value: any): T {
  return value === 'true' ? true :
    value === 'false' ? false :
      value === 'null' ? null :
        +value + '' === value ? +value :
          rbrace.test(value) ? JSON.parse(value) || value :
            value
}
