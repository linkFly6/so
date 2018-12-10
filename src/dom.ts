/**
 * 添加 class
 * @param element dom
 * @param className className，不考虑多个
 */
export const addClass = (element: Element, className: string) => {
  className = className.trim()
  // 如果支持 DOM 3 中的 classList，则使用 classList
  if (element.classList && element.classList.add) {
    element.classList.add(className)
    return element
  }
  // 按照数组进行操作
  const classNames = element.className.split(' ')
  // 有存在项则不在继续
  if (~classNames.indexOf(className)) {
    return element
  }
  classNames.push(className)
  element.className = classNames.join(' ')
  return element
}


/**
 * 移除 class
 * @param element dom
 * @param className className，不考虑多个
 */
export const removeClass = (element: Element, className: string) => {
  className = className.trim()
  if (element.classList && element.classList.remove) {
    element.classList.remove(className)
    return element
  }
  const classNames = element.className.split(' ')
  const index = ~classNames.indexOf(className)
  // 没找到则不再继续
  if (!~index) {
    return element
  }
  classNames.splice(index, 1)
  element.className = classNames.join(' ')
  return element
}

// /**
//  * 获取元素距离页面左侧和顶部的距离
//  * @param elem 
//  */
// export const offset = (elem: HTMLElement) => {
//   // 来自司徒正妹的方法~~~
//   const doc = elem.ownerDocument, pos = { left: 0, top: 0 }
//   if (!doc)
//     return elem
//   const box = elem.getBoundingClientRect(),
//     root = doc.documentElement,
//     clientTop = root.clientTop || 0,
//     clientLeft = root.clientLeft || 0,
//     scrollTop = window.pageXOffset || root.scrollTop,
//     scrollLeft = window.pageXOffset || root.scrollLeft
//   pos.top = box.top + scrollTop - clientTop
//   pos.left = box.left + scrollLeft - clientLeft
// }


export const imageLoad = () => {

}



const noop = function () { }

/**
 * 平缓的滚动元素到指定位置
 * 要求外层容器阻止冒泡
 *
 * @param {Element} el
 * @param {Number|String} to
 * @param {Number} duration
 * @param {Function} callback
 */
export function scrollTo(el: HTMLElement, to: number | 'bottom' | 'top' = 0, duration = 250, callback = noop) {
  if (duration <= 0 || !el) return

  if (to === 'bottom') {
    to = el.scrollHeight - el.offsetHeight
  } else if (to === 'top') {
    to = 0
  }

  clearTimeout((el as any).__scrollTimeout__)

  function _done() {
    el.scrollTop = to as number
    (el as any).__scrollTimeout__ = null
    callback && callback()
  }

  function _next(el: HTMLElement, _to: number, _duration: number, _done: Function) {
    if (_duration <= 0) {
      _done()
      return
    }
    const difference = _to - el.scrollTop
    const perTick = (difference / _duration) * 10;
    (el as any).__scrollTimeout__ = window.setTimeout(function () {
      el.scrollTop = el.scrollTop + perTick
      const diff = el.scrollTop - _to

      if (diff < 5 && diff > -5) {
        _done()
        return
      }

      _next(el, _to, _duration - 10, _done)
    }, 10)
  }

  function _stop() {
    clearTimeout((el as any).__scrollTimeout__)
    el.removeEventListener('touchstart', _stop)
    el.removeEventListener('click', _stop)
  }

  el.addEventListener('touchstart', _stop)
  el.addEventListener('click', _stop)
  _next(el, to, duration, _done)
}

/**
 * 判断元素是否在可视区域
 * 注意这里判断的是元素完全在可视区域，如果元素顶部或者左部有一小部分不在可视区域内，则返回 false
 * 如果要判断顶点，请使用：isElementTopInViewPort
 * @param {*} element 要判断的元素
 * @param {*} viewHeight 页面可视区域高度，默认为 document.documentElement.clientHeight
 * @param {*} viewWidth 页面可视区域宽度，默认为 document.documentElement.clientWidth
 */
export const isElementInViewport = (element: HTMLElement, viewHeight?: number, viewWidth?: number) => {
  const rect = element.getBoundingClientRect()
  if (viewHeight == null) {
    viewHeight = document.documentElement.clientHeight
    viewWidth = document.documentElement.clientWidth
  }
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= viewHeight && rect.right <= viewWidth
}

/**
 * 判断元素的顶部在否在可视区域中
 * - isElementTopInViewPort(element)
 * @param {*} element 要判断的元素
 * @param {*} fixTop 顶部修正，例如需要在元素 10px 的地方才命中判断，则 fixTop 则 10
 * @param {*} viewHeight 页面可视区域高度，默认为 document.documentElement.clientHeight
 */
export const isElementTopInViewPort = (element: HTMLElement, fixTop = 0, viewHeight?: number) => {
  const rect = element.getBoundingClientRect()
  const top = rect.top + fixTop
  if (viewHeight == null) {
    viewHeight = document.documentElement.clientHeight
  }
  return top >= 0 && top <= viewHeight
}
