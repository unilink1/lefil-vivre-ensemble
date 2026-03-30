'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { usePractitioners, useMessages } from '@/hooks/useData'

// Demo fallback data
const demoConversations = [
  { id: 'demo-1', initials: 'SM', name: 'Mme Sophie Martin', specialty: 'Orthophoniste', lastMsg: 'Bonjour ! Leo a fait de super progres...', time: '10:42', unread: 2, online: true },
  { id: 'demo-2', initials: 'JD', name: 'Dr. Jean Dupont', specialty: 'Pediatre', lastMsg: 'Je confirme le rendez-vous de...', time: 'Hier', unread: 0, online: false },
  { id: 'demo-3', initials: 'CL', name: 'Claire Lefebvre', specialty: 'Psychomotricienne', lastMsg: "N'oubliez pas d'apporter le...", time: 'Lun', unread: 0, online: false },
]

const demoMessages = [
  { id: 'demo-m1', from: 'them' as const, text: "Bonjour ! Leo a fait de super progres aujourd'hui lors de sa seance de prononciation. Il a reussi a articuler les sons complexes sans aide !", time: '10:30' },
  { id: 'demo-m2', from: 'me' as const, text: "C'est une excellente nouvelle ! Il etait tres fier de lui en rentrant de l'ecole hier. Merci pour votre patience.", time: '10:42' },
  { id: 'demo-m3', from: 'them' as const, text: 'Je vous en prie. Souhaitez-vous que nous maintenions le creneau de jeudi prochain a 14h ?', time: '10:45' },
]

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

export default function EchangesPage() {
  const { loading: authLoading } = useAuth()
  const { selectedChild, loading: childrenLoading } = useSelectedChild()
  const { practitioners } = usePractitioners(selectedChild?.id)

  // Build conversations from practitioners
  const hasPractitioners = practitioners.length > 0
  const conversations = hasPractitioners
    ? practitioners.map((p) => ({
        id: p.id,
        initials: getInitials(p.first_name, p.last_name),
        name: `${p.first_name} ${p.last_name}`,
        specialty: p.specialty,
        lastMsg: '',
        time: '',
        unread: 0,
        online: p.status === 'actif',
      }))
    : demoConversations

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  // Set first conversation as active when loaded
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id)
    }
  }, [conversations, activeConvId])

  const activeContact = conversations.find(c => c.id === activeConvId) || conversations[0]
  const selectedPractitionerId = hasPractitioners ? activeConvId || undefined : undefined

  // Fetch real messages for the selected conversation
  const { messages: realMessages, send: sendRealMessage, loading: messagesLoading } = useMessages(selectedChild?.id, selectedPractitionerId)

  // Map real messages or use demo
  const hasRealMessages = realMessages.length > 0
  const chatMessages = hasRealMessages
    ? realMessages.map(m => ({
        id: m.id,
        from: m.sender_is_parent ? 'me' as const : 'them' as const,
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }))
    : (!hasPractitioners ? demoMessages : [])

  // For demo mode, keep local messages state
  const [localDemoMessages, setLocalDemoMessages] = useState(demoMessages)
  const displayMessages = hasPractitioners ? chatMessages : localDemoMessages

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    if (hasPractitioners && sendRealMessage) {
      await sendRealMessage(newMessage, true)
    } else {
      setLocalDemoMessages(prev => [...prev, {
        id: `demo-m${prev.length + 1}`,
        from: 'me' as const,
        text: newMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }])
    }
    setNewMessage('')
  }

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id)
    setMobileShowChat(true)
  }

  const handleBackToList = () => {
    setMobileShowChat(false)
  }

  const isLoading = authLoading || childrenLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div
        className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -mx-4 sm:mx-0"
        style={{ height: 'calc(100dvh - 160px)' }}
      >
        {/* Sidebar - conversation list */}
        <div
          className={`w-full sm:w-[340px] border-r border-gray-100 flex flex-col shrink-0 transition-transform duration-200 ${
            mobileShowChat ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Sidebar header */}
          <div className="p-5 pb-4">
            <h2 className="font-semibold text-gray-900 text-lg tracking-tight mb-4">Messages</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 outline-none border border-transparent focus:border-[#4A90D9]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune conversation</p>
                <p className="text-xs text-gray-400 mt-1">Vos echanges avec les praticiens apparaitront ici</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full px-5 py-4 flex items-center gap-3.5 text-left transition-colors duration-150 cursor-pointer border-b border-gray-50 ${
                    activeConvId === conv.id
                      ? 'bg-[#4A90D9]/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 bg-[#4A90D9]/10 text-[#4A90D9] rounded-full flex items-center justify-center font-semibold text-sm">
                      {conv.initials}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-gray-900 text-sm truncate">{conv.name}</span>
                      {conv.time && <span className="text-[11px] text-gray-400 shrink-0 ml-2">{conv.time}</span>}
                    </div>
                    <p className="text-xs text-[#4A90D9] font-medium mb-0.5">{conv.specialty}</p>
                    {conv.lastMsg && (
                      <p className="text-[13px] text-gray-500 truncate">{conv.lastMsg}</p>
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 bg-[#4A90D9] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div
          className={`flex-1 flex flex-col bg-gray-50/50 ${
            mobileShowChat ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="sm:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 bg-[#4A90D9]/10 text-[#4A90D9] rounded-full flex items-center justify-center font-semibold text-sm">
                    {activeContact.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{activeContact.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedChild?.first_name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#4A90D9]/10 text-[#4A90D9] text-[11px] font-medium mr-1.5">
                          {selectedChild.first_name}
                        </span>
                      )}
                      {activeContact.specialty}
                      <span className="mx-1.5 text-gray-300">·</span>
                      {activeContact.online ? (
                        <span className="text-emerald-500">En ligne</span>
                      ) : (
                        <span className="text-gray-400">Hors ligne</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Chargement des messages...</p>
                    </div>
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">Aucun message</p>
                      <p className="text-xs text-gray-400 mt-1">Envoyez le premier message pour demarrer la conversation</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <span className="text-[11px] text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                        Aujourd&apos;hui
                      </span>
                    </div>
                    {displayMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                        style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 ${
                            msg.from === 'me'
                              ? 'bg-[#4A90D9] text-white rounded-2xl rounded-br-md'
                              : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm'
                          }`}
                        >
                          <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
                          <p
                            className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                              msg.from === 'me' ? 'text-white/60 justify-end' : 'text-gray-400'
                            }`}
                          >
                            {msg.time}
                            {msg.from === 'me' && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEnd} />
                  </>
                )}
              </div>

              {/* Input area */}
              <div className="px-5 py-4 bg-white border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-[#4A90D9]/30 focus-within:bg-white transition-all">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Ecrire un message..."
                      className="w-full px-4 py-3 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none max-h-32"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-[#4A90D9] hover:bg-[#3a7bc8] disabled:opacity-40 disabled:hover:bg-[#4A90D9] rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected - desktop empty state */
            <div className="hidden sm:flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-400">Selectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
