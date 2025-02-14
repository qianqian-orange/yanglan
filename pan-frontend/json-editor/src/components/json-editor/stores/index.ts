import { create } from 'zustand'

export type JSONObject = {
  [key: string]:
    | null
    | string
    | number
    | boolean
    | JSONObject
    | Array<null | string | number | boolean | JSONObject>
}

type State = {
  jsonString: string
  jsonObject: JSONObject | null
}

type Action = {
  setJsonString: (str: State['jsonString']) => void
  setJsonObject: (obj: State['jsonObject']) => void
}

export const useJsonStore = create<State & Action>(set => ({
  jsonString: '',
  jsonObject: null,
  setJsonString: str => set(() => ({ jsonString: str })),
  setJsonObject: obj => set(() => ({ jsonObject: obj })),
}))
