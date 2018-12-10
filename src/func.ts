// /**
//  * 函数节流 -  把原函数封装为拥有函数节流阀的函数，当重复调用函数，只有到达这个阀值（wait毫秒）才会执行
//  * 引自underscore
//  * @param {function} func - 回调函数
//  * @param {int} wait - 阀值(ms)
//  * @param {object} options = null - 想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}
//  * @returns {function}
//  */
// export const throttle = function <T= any>(
//   func: T,
//   wait: number, options: { leading?: boolean, trailing?: boolean } = {}): T {
//   let context: any, args: any, result: any
//   let timeout: number | null = null
//   let previous = 0
//   const later = function () {
//     previous = options.leading === false ? 0 : Date.now()
//     timeout = null
//     result = (func as any).apply(context, args)
//     if (!timeout) context = args = null
//   }
//   return function (this: any) {
//     const now = Date.now()
//     if (!previous && options.leading === false) previous = now
//     const remaining = wait - (now - previous)
//     context = this
//     args = arguments
//     if (remaining <= 0 || remaining > wait) {
//       if (timeout) {
//         window.clearTimeout(timeout)
//         timeout = null
//       }
//       previous = now
//       result = (func as any).apply(context, args)
//       if (!timeout) context = args = null
//     } else if (!timeout && options.trailing !== false) {
//       timeout = window.setTimeout(later, remaining)
//     }
//     return result
//   } as any
// }


// /**
//  * 函数节流 -  把原函数封装为拥有防反跳的函数，延迟函数的执行(wait毫秒)，当重复调用函数时候，只执行最后一个调用（在wait毫秒之后）
//  * 引自backbone
//  * @param {function} func - 回调函数
//  * @param {int} wait - 参数
//  * @param {object} immediate = false - 表示是否逆转调用时机，为true表示：wait毫秒内的多次调用，仅第一次生效
//  * @returns {function}
//  */
// export const debounce = function <T extends Function>(func: any, wait: number, immediate = false): T {
//   let timeout: any, args: any, context: any, timestamp: number, result: any

//   const later = function () {
//     const last = Date.now() - timestamp

//     if (last < wait && last >= 0) {
//       timeout = setTimeout(later, wait - last)
//     } else {
//       timeout = null
//       if (!immediate) {
//         result = func.apply(context, args)
//         if (!timeout) context = args = null
//       }
//     }
//   }

//   return function (this: any) {
//     context = this
//     args = arguments
//     timestamp = Date.now()
//     const callNow = immediate && !timeout
//     if (!timeout) timeout = setTimeout(later, wait)
//     if (callNow) {
//       result = func.apply(context, args)
//       context = args = null
//     }
//     return result
//   } as any
// }
