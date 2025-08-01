import api from './useApi'

export const useTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.from) {
      params.append('from', filters.from)
    }
    if (filters.to) {
      params.append('to', filters.to)
    }
    if (filters.type) {
      params.append('type', filters.type)
    }
    if (filters.page) {
      params.append('page', filters.page)
    }
    if (filters.limit) {
      params.append('limit', filters.limit)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const finalUrl = `/wallet/transactions${query}`
    const res = await api.get(finalUrl)
    const data = res.data
    const { transactions, pagination } = data
    return { transactions, pagination }
  } catch (err) {
    console.error('Error in useTransactions:', err)
    return {
      status: false,
      msg: err.message || 'Error fetching transactions',
      transactions: [],
      pagination: null,
    }
  }
}
