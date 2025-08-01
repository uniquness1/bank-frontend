import api from './useApi'

export const useAccountNumber = async () => {
  try {
    const response = await api.post('/auth/generate-account-number')
    const accountNumber = response.data.accountNumber
    return { accountNumber }
  } catch (err) {}
}
