'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useChildren } from '@/hooks/useData'
import type { Child } from '@/lib/supabase'

interface SelectedChildContextType {
  children: Child[]
  selectedChild: Child | null
  selectChild: (id: string) => void
  loading: boolean
}

const SelectedChildContext = createContext<SelectedChildContextType | undefined>(undefined)

export function SelectedChildProvider({ children: reactChildren }: { children: ReactNode }) {
  const { children: childrenList, loading } = useChildren()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (childrenList.length > 0 && !selectedId) {
      setSelectedId(childrenList[0].id)
    }
  }, [childrenList, selectedId])

  const selectedChild = childrenList.find(c => c.id === selectedId) || childrenList[0] || null

  return (
    <SelectedChildContext.Provider value={{
      children: childrenList,
      selectedChild,
      selectChild: setSelectedId,
      loading,
    }}>
      {reactChildren}
    </SelectedChildContext.Provider>
  )
}

export function useSelectedChild() {
  const context = useContext(SelectedChildContext)
  if (!context) throw new Error('useSelectedChild must be used within SelectedChildProvider')
  return context
}
