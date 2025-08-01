import { ref, onMounted, onUnmounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)
  const checkSystemPreference = () => {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    console.warn('window.matchMedia not supported, defaulting to light mode')
    return false
  }
  const applyDarkMode = (dark) => {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }
  const handleSystemChange = (e) => {
    applyDarkMode(e.matches)
  }
  const initDarkMode = () => {
    const systemPrefersDark = checkSystemPreference()
    applyDarkMode(systemPrefersDark)
    if (!window.matchMedia) {
      console.warn('Media query listener not supported')
      return () => {}
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemChange)
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }

  onMounted(() => {
    const cleanup = initDarkMode()
    onUnmounted(() => {
      if (cleanup) cleanup()
    })
  })

  return { isDark }
}
