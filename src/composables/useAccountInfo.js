import api from './useApi'

export const useAccountInfo = async (accountId) => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required')
    }
    const res = await api.get(`/user/account/${accountId}`)
    const account = res.data
    return { account }
  } catch (err) {
    console.error('Error in useAccountInfo:', err)
    return {
      account: null,
      error: true,
      status: false,
      message: err.response?.data?.message || err.message || 'Failed to fetch account info',
    }
  }
}
