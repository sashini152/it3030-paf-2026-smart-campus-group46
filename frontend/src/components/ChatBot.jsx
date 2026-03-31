import { useEffect, useRef, useState } from 'react'

const starterMessages = [
  {
    role: 'bot',
    text: 'Hello. This board is a support assistant. Admin replies should appear on your tracked ticket updates and comments, while this panel helps you submit and follow tickets correctly.',
  },
]

function getBotReply(message) {
  if (/status|track|update/i.test(message)) {
    return 'Open the ticket list or your ticket details page to track the latest status updates. Admin replies should appear in the ticket thread.'
  }

  if (/urgent|escalate|priority|emergency/i.test(message)) {
    return 'If the issue is blocking a class, lab, or campus service, mark the ticket as high priority and include the exact location.'
  }

  if (/wifi|network|internet/i.test(message)) {
    return 'For network issues, include the building, floor, room, and whether the outage affects one device or multiple users.'
  }

  if (/software|system|portal|login/i.test(message)) {
    return 'For software issues, include the system name, the exact error, and a screenshot if possible.'
  }

  if (/hardware|printer|projector|screen|device/i.test(message)) {
    return 'For hardware issues, include the asset or room name and upload a photo if the fault is visible.'
  }

  return 'Thanks for the message. Please include enough detail in the ticket so the support team can respond without asking for the basics again.'
}

export default function ChatBot() {
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    const node = bodyRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, typing])

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed || typing) return

    const userMessage = { role: 'user', text: trimmed }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setTyping(true)

    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'bot', text: getBotReply(trimmed) }])
      setTyping(false)
    }, 550)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <section className="rounded-[30px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6fb_100%)] p-6 text-[#0f172a] shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Support Assistant</p>
          <h2 className="mt-2 text-xl font-semibold">Ticket help board</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b9d7d6] bg-white px-3 py-1 text-xs font-semibold text-[#327f7d]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#327f7d]" />
          Guide
        </span>
      </div>

      <div
        ref={bodyRef}
        className="mt-5 flex h-80 flex-col gap-3 overflow-y-auto rounded-[24px] border border-[#dde5ef] bg-[#f8fbff] p-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === 'bot' ? 'mr-8 rounded-[20px] bg-white p-3 shadow-sm' : 'ml-8 rounded-[20px] bg-[#18314f] p-3 text-white shadow-sm'}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${message.role === 'bot' ? 'text-[#327f7d]' : 'text-[#b9d7d6]'}`}>
              {message.role === 'bot' ? 'Support' : 'You'}
            </p>
            <p className={`mt-2 text-sm leading-6 ${message.role === 'bot' ? 'text-[#475569]' : 'text-white'}`}>{message.text}</p>
          </div>
        ))}

        {typing && (
          <div className="mr-8 rounded-[20px] bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#327f7d]">Support</p>
            <p className="mt-2 text-sm text-[#64748b]">Typing...</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[24px] border border-[#dde5ef] bg-white p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Ask about ticket status, urgency, hardware, software, or campus support."
          className="w-full resize-none border-0 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[#64748b]">Press Enter to send</p>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="inline-flex items-center justify-center rounded-2xl border border-[#327f7d] bg-[linear-gradient(180deg,#274c77_0%,#163455_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(50,127,125,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send message
          </button>
        </div>
      </div>
    </section>
  )
}
