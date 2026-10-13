import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquareText,
  Send,
  Sparkles,
  X,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Maximize2,
  Trash2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { processAssistantQuery } from '../services/assistant/intentEngine'
import { db } from '../services/db'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const SUGGESTIONS = [
  'Aaj ki sales kitni hui?',
  'Low stock products dikhao',
  'Sab se zyada udhaar kiska hai?',
  'Is mahine ka profit batao',
  'Top 5 selling products',
  'How do I use STOQVIA?',
]

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const navigate = useNavigate()
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
              text: 'Salam! Main STOQVIA Smart Assistant hoon. Aap mujh se sales, low stock, customer udhaar, profit ya kisi product ke baare mein poch sakte hain.',
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } catch {
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: 'Salam! Main STOQVIA Smart Assistant hoon. Aap mujh se sales, low stock, customer udhaar, profit ya kisi product ke baare mein poch sakte hain.',
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

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser.', 'warning')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      sendMessage(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/[*_#`-]/g, '')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    showToast('Copied to clipboard.')
  }

  const clearChat = async () => {
    try {
      await db.chatHistory.clear()
    } catch {}
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How may I assist your business today?',
        timestamp: new Date().toISOString(),
      },
    ])
    showToast('Chat history cleared.')
  }

  const sendMessage = async (textToSend) => {
    const prompt = (textToSend || input).trim()
    if (!prompt) return

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Save user message to Dexie
    try {
      await db.chatHistory.add(userMsg)
    } catch {}

    // Process through local intent engine
    setTimeout(async () => {
      try {
        const reply = await processAssistantQuery(prompt)
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
        const errorMsg = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Maazrat, sawal process karne mein issue aya. Dobara koshish karein.',
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setTyping(false)
      }
    }, 400)
  }

  const handleExecuteAction = async (msg) => {
    if (!msg.action) return
    if (msg.action.type === 'CONFIRM_EXPENSE') {
      try {
        await api.expenses.create(msg.action.payload)
        showToast(`Rs ${msg.action.payload.amount} expense successfully recorded!`)
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'assistant',
            text: `✅ Expense of Rs ${msg.action.payload.amount.toLocaleString()} for "${msg.action.payload.title}" record ho gaya hai.`,
            timestamp: new Date().toISOString(),
          },
        ])
      } catch (err) {
        showToast('Failed to record expense: ' + err.message, 'error')
      }
    }
  }

  return (
    <div className="chatbot-widget">
      {!open && (
        <button
          className="chatbot-fab"
          onClick={() => setOpen(true)}
          aria-label="Open STOQVIA Assistant"
          title="Open STOQVIA Assistant"
          style={{
            background: 'linear-gradient(135deg, #F3C74D 0%, #D4AF37 50%, #14B8A6 100%)',
            boxShadow: '0 8px 30px rgba(212, 175, 55, 0.4)',
            color: '#0A0A0B',
          }}
        >
          <Sparkles size={24} />
        </button>
      )}

      {open && (
        <div
          className="chatbot-panel card-glass animate-fade-in"
          style={{
            width: 'min(420px, calc(100vw - 28px))',
            borderRadius: '20px',
            border: '1px solid var(--line-gold)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'min(620px, calc(100vh - 100px))',
          }}
        >
          {/* Header */}
          <div
            className="chatbot-header"
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #141416 0%, #1C1C1F 100%)',
              borderBottom: '1px solid var(--line-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  STOQVIA Assistant
                </h4>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--teal)', fontWeight: 600 }}>● Offline AI Active</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="icon-btn"
                style={{ padding: 6, color: 'var(--muted)' }}
                onClick={() => {
                  setOpen(false)
                  navigate('/assistant')
                }}
                title="Full Page View"
                aria-label="Full Page View"
              >
                <Maximize2 size={15} />
              </button>
              <button
                className="icon-btn"
                style={{ padding: 6, color: 'var(--muted)' }}
                onClick={clearChat}
                title="Clear Chat"
                aria-label="Clear Chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                className="icon-btn"
                style={{ padding: 6, color: 'var(--muted)' }}
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick suggestions bar */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              padding: '8px 12px',
              background: 'rgba(212, 175, 55, 0.04)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => sendMessage(sug)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid var(--line)',
                  background: 'var(--card-elevated)',
                  color: 'var(--ink-soft)',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div
            className="chatbot-thread"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
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
                    maxWidth: '88%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                        : 'var(--card-elevated)',
                      color: isUser ? '#0A0A0B' : 'var(--ink)',
                      border: isUser ? 'none' : '1px solid var(--line)',
                      boxShadow: isUser
                        ? '0 4px 14px rgba(212, 175, 55, 0.25)'
                        : '0 2px 8px rgba(0, 0, 0, 0.2)',
                      fontSize: 13,
                      lineHeight: 1.5,
                      fontWeight: isUser ? 600 : 400,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}

                    {/* Table Render if response contains structured table */}
                    {msg.table && (
                      <div style={{ marginTop: 10, overflowX: 'auto' }}>
                        <table
                          style={{
                            width: '100%',
                            fontSize: 11,
                            borderCollapse: 'collapse',
                            background: 'var(--card)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                          }}
                        >
                          <thead>
                            <tr style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                              {msg.table.headers.map((h) => (
                                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--gold)' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.table.rows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                                {Object.values(row).map((val, cellIdx) => (
                                  <td key={cellIdx} style={{ padding: '6px 8px', color: 'var(--ink)' }}>
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
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn--gold"
                          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 6 }}
                          onClick={() => handleExecuteAction(msg)}
                        >
                          <CheckCircle size={13} /> Confirm Action
                        </button>
                      </div>
                    )}

                    {/* Navigation Link Button */}
                    {msg.path && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => {
                            setOpen(false)
                            navigate(msg.path)
                          }}
                        >
                          <span>{msg.actionLabel || 'View Details'}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bubble Toolbar: Copy & Text-to-speech */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      padding: '0 4px',
                    }}
                  >
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Copy"
                          aria-label="Copy"
                        >
                          {copiedId === msg.id ? <Check size={11} style={{ color: 'var(--teal)' }} /> : <Copy size={11} />}
                        </button>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                          onClick={() => handleSpeak(msg.text)}
                          title="Listen"
                          aria-label="Listen"
                        >
                          <Volume2 size={11} />
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
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--card-elevated)',
                  border: '1px solid var(--line)',
                  color: 'var(--muted)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={13} className="spin" style={{ color: 'var(--gold)' }} />
                <span>STOQVIA AI is analyzing records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            style={{
              padding: '12px 14px',
              background: 'var(--card)',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              type="button"
              className="icon-btn"
              onClick={handleVoiceInput}
              style={{
                color: listening ? 'var(--brick)' : 'var(--gold)',
                background: listening ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.1)',
                padding: 8,
                borderRadius: '8px',
              }}
              title={listening ? 'Stop listening' : 'Voice input'}
              aria-label="Voice input"
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sales, stock or udhaar..."
              style={{
                flex: 1,
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '9px 12px',
                fontSize: 13,
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
                padding: '9px 14px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: input.trim() ? 1 : 0.5,
              }}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
