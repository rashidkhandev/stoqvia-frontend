import { createContext, useContext, useState } from 'react'

const BranchContext = createContext(null)

export const BRANCHES = [
  { id: 'all', name: 'All Branches' },
  { id: 'b1', name: 'Karachi Branch' },
  { id: 'b2', name: 'Peshawar Branch' },
  { id: 'b3', name: 'Lahore Branch' },
]

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState(BRANCHES)
  const [activeBranchId, setActiveBranchId] = useState('b1')

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[1]

  const addBranch = (name) => {
    setBranches((prev) => [...prev, { id: `b${Date.now()}`, name }])
  }

  const removeBranch = (id) => {
    setBranches((prev) => prev.filter((b) => b.id !== id))
    if (activeBranchId === id) setActiveBranchId('all')
  }

  const value = { branches, activeBranchId, activeBranch, setActiveBranchId, addBranch, removeBranch }

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used inside BranchProvider')
  return ctx
}
