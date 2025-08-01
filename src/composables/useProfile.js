import api from './useApi'

export const useProfile = async () => {
  try {
    const res = await api.get('/user/profile')
    const profile = res.data
    return { profile }
  } catch (err) {
    return { status: false, msg: '', ...err }
  }
}
