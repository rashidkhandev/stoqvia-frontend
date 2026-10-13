import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Users,
  Package,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from 'lucide-react'
import { processAssistantQuery } from '../services/assistant/intentEngine'
import { db } from '../services/db'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const QUICK_ACTIONS = [
  { icon: TrendingUp, title: "Today's Sales Breakdown", query: "Aaj ki sales kitni hui?" },
  { icon: AlertTriangle, title: 'Low & Out of Stock Items', query: 'Low stock products dikhao' },
  { icon: Users, title: 'Top Khata Debtors', query: 'Sab se zyada udhaar kiska hai?' },
  { icon: Package, title: 'This Month Net Profit', query: 'Is mahine ka profit batao' },
  { icon: HelpCircle, title: 'Step-by-Step App Guide', query: 'How do I use STOQVIA?' },
]

export default function Assistant() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const { showToast } = useToast()

  // Load chat history from Dexie DB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await db.chatHistory.orderBy('timestamp').toArray()
        if (history.length > 0) {
          setMessages(history)
        } else {
          setMessages([
            {
              id: 'welcome',
              sender: 'assistant',
              text: 'Welcome to **STOQVIA AI Intelligence Center**. I am connected directly to your offline business database. How can I help your store today?',
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } catch {
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: 'Welcome to **STOQVIA AI Intelligence Center**. I am connected directly to your offline business database. How can I help your store today?',
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'warning')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setInput(text)
      handleSend(text)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    showToast('Copied to clipboard.')
  }

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const clean = text.replace(/[*_#`-]/g, '')
      const utt = new SpeechSynthesisUtterance(clean)
      window.speechSynthesis.speak(utt)
    }
  }

  const clearChat = async () => {
    try {
      await db.chatHistory.clear()
    } catch {}
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. What would you like to analyze next?',
        timestamp: new Date().toISOString(),
      },
    ])
    showToast('Conversation reset.')
  }

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim()
    if (!textToSend) return

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      await db.chatHistory.add(userMsg)
    } catch {}

    setTimeout(async () => {
      try {
        const reply = await processAssistantQuery(textToSend)
        const assistantMsg = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply.text,
          type: reply.type,
          table: reply.table,
          product: reply.product,
          action: reply.action,
          actionLabel: reply.actionLabel,
          path: reply.path,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMsg])
        try {
          await db.chatHistory.add(assistantMsg)
        } catch {}
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: 'An error occurred while analyzing records: ' + err.message,
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setTyping(false)
      }
    }, 350)
  }

  const handleExecuteAction = async (msg) => {
    if (!msg.action) return
    if (msg.action.type === 'CONFIRM_EXPENSE') {
      try {
        await api.expenses.create(msg.action.payload)
        showToast(`Rs ${msg.action.payload.amount} expense recorded!`)
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'assistant',
            text: `✅ Expense of Rs ${msg.action.payload.amount.toLocaleString()} for "${msg.action.payload.title}" successfully recorded into database.`,
            timestamp: new Date().toISOString(),
          },
        ])
      } catch (err) {
        showToast('Error recording expense: ' + err.message, 'error')
      }
    }
  }

  return (
    <div className="page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontFamily: 'var(--font-display)' }}>
                STOQVIA AI Assistant & Intelligence Desk
              </h1>
              <p className="page-subtitle" style={{ margin: 0 }}>
                Live offline decision intelligence, voice parsing & business automation
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn--ghost" onClick={clearChat}>
            <Trash2 size={15} /> Clear History
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Chat Main View */}
        <div
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid var(--line-gold)',
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'var(--paper)',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                        : 'var(--card-elevated)',
                      color: isUser ? '#0A0A0B' : 'var(--ink)',
                      border: isUser ? 'none' : '1px solid var(--line)',
                      boxShadow: isUser
                        ? '0 6px 20px rgba(212, 175, 55, 0.25)'
                        : 'var(--shadow-card)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      fontWeight: isUser ? 600 : 400,
                    }}
                  >
                    {msg.text}

                    {/* Table Render */}
                    {msg.table && (
                      <div style={{ marginTop: 12, overflowX: 'auto' }}>
                        <table
                          className="data-table"
                          style={{
                            width: '100%',
                            fontSize: 12,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--line)',
                          }}
                        >
                          <thead>
                            <tr style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                              {msg.table.headers.map((h) => (
                                <th key={h} style={{ padding: '8px 12px', color: 'var(--gold)' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.table.rows.map((row, idx) => (
                              <tr key={idx}>
                                {Object.values(row).map((val, cellIdx) => (
                                  <td key={cellIdx} style={{ padding: '8px 12px' }}>
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Action Confirmation Button */}
                    {msg.action && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          className="btn btn--gold"
                          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8 }}
                          onClick={() => handleExecuteAction(msg)}
                        >
                          <CheckCircle size={15} /> Confirm and Execute Action
                        </button>
                      </div>
                    )}

                    {/* Navigation Link Button */}
                    {msg.path && (
                      <div style={{ marginTop: 10 }}>
                        <a
                          href={msg.path}
                          className="btn btn--ghost"
                          style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <span>{msg.actionLabel || 'Go to page'}</span>
                          <ArrowRight size={13} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions & Timestamp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      padding: '0 6px',
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Copy message"
                          aria-label="Copy message"
                        >
                          {copiedId === msg.id ? <Check size={12} style={{ color: 'var(--teal)' }} /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                          onClick={() => handleSpeak(msg.text)}
                          title="Read aloud"
                          aria-label="Read aloud"
                        >
                          <Volume2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            {typing && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 18px',
                  borderRadius: '18px 18px 18px 4px',
                  background: 'var(--card-elevated)',
                  border: '1px solid var(--line)',
                  color: 'var(--muted)',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Sparkles size={15} className="spin" style={{ color: 'var(--gold)' }} />
                <span>STOQVIA AI is querying live store records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{
              padding: '16px 20px',
              background: 'var(--card)',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              className="icon-btn"
              onClick={handleVoice}
              style={{
                color: listening ? 'var(--brick)' : 'var(--gold)',
                background: listening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.1)',
                padding: 10,
                borderRadius: '10px',
              }}
              title={listening ? 'Stop voice recognition' : 'Speak your query'}
              aria-label="Voice input"
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about today's sales, low stock, customer udhaar, profit or record expenses..."
              style={{
                flex: 1,
                border: '1px solid var(--line)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: 14,
                background: 'var(--paper)',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="btn btn--gold"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: input.trim() ? 1 : 0.5,
              }}
            >
              <span>Ask AI</span>
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Sidebar Quick Prompts & Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
              ⚡ Quick Intelligence Queries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(action.query)}
                    className="card-glass"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        background: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{action.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel" style={{ padding: '16px', flex: 1 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
              💡 Natural Language Tips
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              <li>Ask in <strong>English</strong>, <strong>Urdu</strong>, or <strong>Roman Urdu</strong>.</li>
              <li>Say: <em>"Add expense 500 for lunch"</em> to auto-record expenses.</li>
              <li>Say: <em>"Panadol ka stock kitna hai?"</em> for instant stock count.</li>
              <li>Say: <em>"Open POS"</em> to navigate straight to checkout.</li>
              <li>Works <strong>100% offline</strong> without requiring an internet connection.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
