<template>
  <div class="cards-page">
    <h1>My Virtual Cards</h1>
    <button @click="showGenerateModal = true">Generate New Card</button>
    <div v-if="loading">Loading cards...</div>
    <div v-else>
      <div v-if="cards.length === 0">No cards found.</div>
      <ul v-else class="card-list">
        <li v-for="card in filteredCards" :key="card?._id || card?.id || Math.random()" class="card-item">
          <div>
            <strong>Card Number:</strong> {{ maskCardNumber(card.cardNumber) }}<br />
            <strong>Status:</strong> {{ card.status || 'N/A' }}<br />
            <strong>Expiry:</strong> {{ card.expiry || 'N/A' }}<br />
            <strong>Type:</strong> {{ card.cardType || 'N/A' }}
          </div>
          <button v-if="card.status === 'active'" @click="blockCard(card._id)">Block</button>
        </li>
      </ul>
    </div>
    <!-- Generate Card Modal -->
    <div v-if="showGenerateModal" class="modal">
      <div class="modal-content">
        <h2>Generate New Card</h2>
        <p>Are you sure you want to generate a new virtual card?</p>
        <button @click="generateCard">Yes, Generate</button>
        <button @click="showGenerateModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import useCards from '../../composables/useCards.js'

const { getCards, createCard, blockCardById } = useCards()
const cards = ref([])
const loading = ref(true)
const showGenerateModal = ref(false)

const filteredCards = computed(() => cards.value.filter(Boolean))

function maskCardNumber(number) {
  return number ? number.replace(/.(?=.{4})/g, '*') : ''
}

async function fetchCards() {
  loading.value = true
  cards.value = await getCards()
  loading.value = false
}

async function generateCard() {
  await createCard()
  showGenerateModal.value = false
  fetchCards()
}

async function blockCard(id) {
  if (confirm('Block this card?')) {
    await blockCardById(id)
    fetchCards()
  }
}

onMounted(fetchCards)
</script>

<style scoped>
.cards-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.card-list {
  list-style: none;
  padding: 0;
}

.card-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
}
</style>