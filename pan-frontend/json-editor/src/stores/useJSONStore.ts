import { create } from 'zustand'

type JSONObject = {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | Array<JSONObject>
}

type State = {
  jsonString: string
  jsonObject: JSONObject | null
}

type Action = {
  updateJSONString: (str: State['jsonString']) => void
  updateJSONObject: (obj: State['jsonObject']) => void
}

const useJSONStore = create<State & Action>(set => ({
  jsonString: '',
  jsonObject: null,
  updateJSONString: str => set(() => ({ jsonString: str })),
  updateJSONObject: obj => set(() => ({ jsonObject: obj })),
}))

export { useJSONStore }
