import { ref } from 'vue'

// Global transaction event bus
const transactionEventBus = ref(null)

// Create a simple event emitter
const createEventBus = () => {
  const listeners = new Map()
  
  return {
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, [])
      }
      listeners.get(event).push(callback)
    },
    
    emit(event, data) {
      if (listeners.has(event)) {
        listeners.get(event).forEach(callback => {
          try {
            callback(data)
          } catch (error) {
            console.error('Error in event listener:', error)
          }
        })
      }
    },
    
    off(event, callback) {
      if (listeners.has(event)) {
        const callbacks = listeners.get(event)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }
}

// Initialize the event bus
if (!transactionEventBus.value) {
  transactionEventBus.value = createEventBus()
}

export const useTransactionEvents = () => {
  const eventBus = transactionEventBus.value
  
  const emitTransactionCompleted = (transactionData = null) => {
    eventBus.emit('transaction-completed', transactionData)
  }
  
  const onTransactionCompleted = (callback) => {
    eventBus.on('transaction-completed', callback)
  }
  
  const offTransactionCompleted = (callback) => {
    eventBus.off('transaction-completed', callback)
  }
  
  return {
    emitTransactionCompleted,
    onTransactionCompleted,
    offTransactionCompleted
  }
} 