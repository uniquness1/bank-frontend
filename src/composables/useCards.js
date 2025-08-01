import api from './useApi'

export default function useCards() {
  async function getCards() {
    try {
      const res = await api.get('/api/cards')
      return res.data.cards || []
    } catch (e) {
      return []
    }
  }

  async function createCard() {
    try {
      await api.post('/api/cards')
    } catch (e) {}
  }

  async function blockCardById(id) {
    try {
      await api.patch(`/api/cards/${id}/block`)
    } catch (e) {}
  }

  return { getCards, createCard, blockCardById }
}
