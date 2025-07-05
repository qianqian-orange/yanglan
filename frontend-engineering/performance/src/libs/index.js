// 获取PerformanceNavigationTiming实例
function getNavigationEntry() {
  return performance.getEntriesByType('navigation')[0]
}

function whenReady(callback) {
  // readyState的可选值: loading - document文档解析中、interactive - 对应DOMContentLoaded事件触发、complete - 对应load事件触发
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => callback(), true)
  } else {
    setTimeout(callback)
  }
}

export function onTTFB(callback) {
  const metric = {
    name: 'TTFB',
    value: 0,
    entries: [],
  }

  whenReady(() => {
    const navigationEntry = getNavigationEntry()
    // 记录首个字节返回时间
    metric.value = navigationEntry.responseStart
    metric.entries = [navigationEntry]
    callback(metric)
  })
}

export function onFCP(callback) {
  const metric = {
    name: 'FCP',
    value: 0,
    entries: [],
  }

  const handleEntries = entries => {
    entries.forEach(entry => {
      console.log(entry.name)
      if (entry.name === 'first-contentful-paint') {
        po.disconnect()
        metric.value = entry.startTime
        metric.entries.push(entry)
        callback(metric)
      }
    })
  }

  const po = new PerformanceObserver(list => {
    Promise.resolve().then(() => handleEntries(list.getEntries()))
  })

  po.observe({ type: 'paint', buffered: true })
}

export function onLCP(callback) {
  const metric = {
    name: 'LCP',
    value: 0,
    entries: [],
  }

  const handleEntries = entries => {
    entries = entries.slice(-1)
    const entry = entries[0]
    metric.value = entry.startTime
    metric.entries = [entry]
    callback(metric)
  }

  const po = new PerformanceObserver(list => {
    Promise.resolve().then(() => handleEntries(list.getEntries()))
  })

  po.observe({ type: 'largest-contentful-paint', buffered: true })
}

class LayoutShiftManager {
  _sessionValue = 0
  _sessionEntries = []

  _processEntry(entry) {
    if (this._sessionValue) {
      this._sessionValue += entry.value
      this._sessionEntries.push(entry)
    } else {
      this._sessionValue = entry.value
      this._sessionEntries = [entry]
    }
  }
}

export function onCLS(callback) {
  const metric = {
    name: 'CLS',
    value: 0,
    entries: [],
  }

  const layoutShiftManager = new LayoutShiftManager()

  const handleEntries = entries => {
    entries.forEach(entry => {
      layoutShiftManager._processEntry(entry)
    })
    metric.value = layoutShiftManager._sessionValue
    metric.entries = layoutShiftManager._sessionEntries
    callback(metric)
  }

  const po = new PerformanceObserver(list => {
    Promise.resolve().then(() => handleEntries(list.getEntries()))
  })

  po.observe({ type: 'layout-shift', buffered: true })
}
