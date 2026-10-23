import { ref } from 'vue'

export type ToastType = 'success' | 'info' | 'error'

export interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}

const toastState = ref<ToastState>({
  visible: false,
  message: '',
  type: 'success'
})

let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(message: string, type: ToastType = 'success', duration = 1800) {
    if (timer) clearTimeout(timer)
    toastState.value = {
      visible: true,
      message,
      type
    }
    timer = setTimeout(() => {
      toastState.value.visible = false
    }, duration)
  }

  function hide() {
    if (timer) clearTimeout(timer)
    toastState.value.visible = false
  }

  return {
    toast: toastState,
    show,
    hide
  }
}
