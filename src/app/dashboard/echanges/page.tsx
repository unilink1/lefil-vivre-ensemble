'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, usePractitioners, useMessages } from '@/hooks/useData'

// Demo fallback data
const demoConversations = [
  { id: 'demo-1', initials: 'SM', name: 'Mme Sophie Martin', specialty: 'Orthophoniste', lastMsg: "Bonjour ! Leo a fait de super progres...", time: '10:42', unread: 2, online: true, color: 'bg-secondary-container' },
  { id: 'demo-2', initials: 'JD', name: 'Dr. Jean Dupont', specialty: 'Pediatre', lastMsg: 'Je confirme le rendez-vous de...', time: 'Hier', unread: 0, online: false, color: 'bg-primary-fixed' },
  { id: 'demo-3', initials: 'CL', name: 'Claire Lefebvre', specialty: 'Psychomotricienne', lastMsg: "N'oubliez pas d'apporter le...", time: 'Lun', unread: 0, online: false, color: 'bg-tertiary-fixed' },
]

const demoMessages = [
  { id: 'demo-m1', from: 'them' as const, text: "Bonjour ! Leo a fait de super progres aujourd'hui lors de sa seance de prononciation. Il a reussi a articuler les sons complexes sans aide !", time: '10:30' },
  { id: 'demo-m2', from: 'me' as const, text: "C'est une excellente nouvelle ! Il etait tres fier de lui en rentrant de l'ecole hier. Merci pour votre patience.", time: '10:42' },
  { id: 'demo-m3', from: 'them' as const, text: 'Je vous en prie. Souhaitez-vous que nous maintenions le creneau de jeudi prochain a 14h ?', time: '10:45' },
]

const convColors = ['bg-secondary-container', 'bg-primary-fixed', 'bg-tertiary-fixed', 'bg-primary-fixed-dim', 'bg-tertiary-fixed-dim']

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

export default function EchangesPage() {
  const { loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { practitioners, loading: practLoading } = usePractitioners(firstChild?.id)

  // Build conversations from practitioners
  const hasPractitioners = practitioners.length > 0
  const conversations = hasPractitioners
    ? practitioners.map((p, i) => ({
        id: p.id,
        initials: getInitials(p.first_name, p.last_name),
        name: `${p.first_name} ${p.last_name}`,
        specialty: p.specialty,
        lastMsg: '',
        time: '',
        unread: 0,
        online: p.status === 'actif',
        color: convColors[i % convColors.length],
      }))
    : demoConversations

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
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
  const { messages: realMessages, send: sendRealMessage, loading: messagesLoading } = useMessages(firstChild?.id, selectedPractitionerId)

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
      // Demo mode
      setLocalDemoMessages(prev => [...prev, {
        id: `demo-m${prev.length + 1}`,
        from: 'me' as const,
        text: newMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }])
    }
    setNewMessage('')
  }

  const isLoading = authLoading || childrenLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex bg-surface-card rounded-3xl shadow-[0_8px_32px_rgba(26,28,27,0.04)] overflow-hidden -mx-4 sm:mx-0" style={{ height: 'calc(100dvh - 180px)' }}>
        {/* Sidebar */}
        <div className={`w-full sm:w-80 border-r border-outline-variant/10 flex flex-col shrink-0 ${activeConvId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-outline-variant/10">
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-3">Echanges</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {['Tous', 'Urgents', 'Suivi'].map((f, i) => (
                <button key={f} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  i === 0 ? 'gradient-primary text-white' : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                }`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <motion.button
                key={conv.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-4 flex items-start gap-3 text-left transition-all cursor-pointer border-b border-outline-variant/5 ${
                  activeConvId === conv.id ? 'bg-primary-fixed/20' : 'hover:bg-surface-low'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 ${conv.color} rounded-2xl flex items-center justify-center font-bold text-sm`}>
                    {conv.initials}
                  </div>
                  {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface text-sm truncate">{conv.name}</span>
                    {conv.time && <span className="text-[10px] text-outline shrink-0">{conv.time}</span>}
                  </div>
                  <span className="text-xs text-primary">{conv.specialty}</span>
                  {conv.lastMsg && <p className="text-sm text-on-surface-variant truncate mt-0.5">{conv.lastMsg}</p>}
                </div>
                {conv.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 gradient-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className={`${activeConvId ? 'flex' : 'hidden'} sm:flex flex-col flex-1`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveConvId(null)}
                className="sm:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-low rounded-xl cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
              </motion.button>
              <div className={`w-10 h-10 ${activeContact?.color} rounded-xl flex items-center justify-center font-bold text-sm`}>
                {activeContact?.initials}
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">{activeContact?.name}</p>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <Badge variant="primary" size="sm">{firstChild?.first_name || 'votre enfant'}</Badge>
                  {activeContact?.specialty} — {activeContact?.online ? <span className="text-secondary">En ligne</span> : 'Hors ligne'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 hover:bg-surface-low rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">videocam</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 hover:bg-surface-low rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">info</span>
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messagesLoading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-on-surface-variant">Chargement des messages...</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <span className="text-xs text-outline bg-surface-low px-3 py-1 rounded-full">Aujourd&apos;hui</span>
                </div>
                {displayMessages.length === 0 && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-outline text-[48px] mb-3 block">chat_bubble_outline</span>
                    <p className="text-sm text-on-surface-variant">Aucun message pour le moment. Envoyez le premier !</p>
                  </div>
                )}
                <AnimatePresence>
                  {displayMessages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-4 rounded-2xl ${
                        msg.from === 'me'
                          ? 'gradient-primary text-white rounded-br-md'
                          : 'bg-surface-low text-on-surface rounded-bl-md'
                      }`}>
                        <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${msg.from === 'me' ? 'text-white/60 justify-end' : 'text-outline'}`}>
                          {msg.time}
                          {msg.from === 'me' && <span className="material-symbols-outlined text-[12px]">done_all</span>}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEnd} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-outline-variant/10">
            <div className="flex items-end gap-3">
              <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 hover:bg-surface-low rounded-xl cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant">add_circle</span>
              </motion.button>
              <div className="flex-1 bg-surface-low rounded-2xl">
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ecrire un message..."
                  className="w-full p-3.5 bg-transparent text-sm text-on-surface placeholder:text-outline/50 outline-none resize-none max-h-32"
                  rows={1}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={sendMessage}
                className="p-3 gradient-primary rounded-xl shadow-lg shadow-primary/20 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-white text-[22px]">send</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
