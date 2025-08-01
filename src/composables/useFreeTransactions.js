import api from './useApi'

export const useFreeTransactions = async () => {
  try {
    const res = await api.get('/wallet/free-transactions-left')
    const data = res.data
    return { freeTransactionsLeft: data.data.freeTransactionsLeft }
  } catch (err) {
    return { status: false, msg: '', ...err }
  }
}
