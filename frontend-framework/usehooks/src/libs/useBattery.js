import React from 'react'

export function useBattery() {
  const [state, setState] = React.useState({
    supported: true,
    loading: true,
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
  })

  React.useEffect(() => {
    if (!navigator.getBattery) {
      setState(s => ({
        ...s,
        supported: false,
        loading: false,
      }))
      return
    }

    let battery = null

    const handleChange = () => {
      setState({
        supported: true,
        loading: false,
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      })
    }

    navigator.getBattery().then(b => {
      battery = b
      handleChange()

      b.addEventListener('levelchange', handleChange)
      b.addEventListener('chargingchange', handleChange)
      b.addEventListener('chargingtimechange', handleChange)
      b.addEventListener('dischargingtimechange', handleChange)
    })

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', handleChange)
        battery.removeEventListener('chargingchange', handleChange)
        battery.removeEventListener('chargingtimechange', handleChange)
        battery.removeEventListener('dischargingtimechange', handleChange)
      }
    }
  }, [])

  return state
}
