import { useEffect, useRef, useState } from 'react'
import SurfaceCard from './SurfaceCard'

const quickPrompts = [
  'How do I track my ticket?',
  'When should I use high priority?',
  'What should I include for network issues?',
]

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

  const applyPrompt = (prompt) => {
    setInput(prompt)
  }

  return (
    <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-[#181A2F] !text-white shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">Support Assistant</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Ticket help board</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#FDA481] bg-[#242E49] px-3 py-1 text-xs font-semibold text-[#FDA481]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FDA481]" />
          Guide
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => applyPrompt(prompt)}
            className="hub-button-pop whitespace-nowrap rounded-full border border-[#37415C] bg-[#242E49] px-3 py-2 text-xs font-semibold text-white"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div
        ref={bodyRef}
        className="mt-5 flex h-80 flex-col gap-3 overflow-y-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`hub-message-enter ${message.role === 'bot' ? 'mr-8 rounded-[20px] bg-white p-3 shadow-none' : 'ml-8 rounded-[20px] bg-[#54162B] p-3 text-white shadow-none'}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${message.role === 'bot' ? 'text-[#B4182D]' : 'text-[#FDA481]'}`}>
              {message.role === 'bot' ? 'Support' : 'You'}
            </p>
            <p className={`mt-2 text-sm leading-6 ${message.role === 'bot' ? 'text-[#181A2F]' : 'text-white'}`}>{message.text}</p>
          </div>
        ))}

        {typing && (
          <div className="mr-8 rounded-[20px] bg-white p-3 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4182D]">Support</p>
            <p className="mt-2 text-sm text-[#181A2F]">Typing...</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[24px] border border-[#37415C] bg-white p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Ask about ticket status, urgency, hardware, software, or campus support."
          className="w-full resize-none border-0 bg-transparent text-sm text-[#181A2F] outline-none placeholder:text-[#37415C]"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[#37415C]">Press Enter to send</p>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="hub-button-pop inline-flex items-center justify-center rounded-2xl border border-[#181A2F] bg-[#181A2F] px-4 py-2 text-sm font-semibold text-white shadow-none transition hover:bg-[#242E49] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send message
          </button>
        </div>
      </div>
    </SurfaceCard>
  )
}
