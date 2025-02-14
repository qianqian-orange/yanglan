import { create } from 'zustand'

type State = {
  jsonString: string
}

type Action = {
  updateJSONString: (str: State['jsonString']) => void
}

const useJSONStore = create<State & Action>(set => ({
  jsonString: '',
  updateJSONString: jsonString => set(() => ({ jsonString })),
}))

export { useJSONStore }
