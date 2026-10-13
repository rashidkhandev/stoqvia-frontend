import test from 'node:test'
import assert from 'node:assert/strict'
import { buildChatAssistantReply } from './chatAssistant.js'

test('summarizes low stock query', () => {
  const reply = buildChatAssistantReply({
    message: 'low stock',
    products: [
      { name: 'Milk 1L', quantity: 3, minStock: 10 },
      { name: 'Rice 5kg', quantity: 12, minStock: 5 },
    ],
    sales: [{ total: 1500 }, { total: 2000 }],
    customers: [{ remainingBalance: 500 }, { remainingBalance: 250 }],
    branchName: 'Karachi Branch',
  })

  assert.match(reply.toLowerCase(), /low stock|milk/i)
})

test('answers sales query', () => {
  const reply = buildChatAssistantReply({
    message: 'how much sales',
    products: [],
    sales: [{ total: 1000 }, { total: 500 }],
    customers: [],
    branchName: 'Karachi Branch',
  })

  assert.match(reply.toLowerCase(), /total sales|rs 1500|1500/i)
})
