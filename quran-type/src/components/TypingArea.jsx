import { useEffect, useRef, useState } from 'react'
import useQuranStore from '../store/useQuranStore'
import { useTypingEngine } from '../hooks/useTypingEngine'

export default function TypingArea({ onComplete }) {
  const { targetText, theme } = useQuranStore()
  const { charStatuses, currentIndex, isComplete, wpm, accuracy, reset, handleKey } = useTypingEngine(targetText)
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(true)

  const muted = theme === 'dark' ? '#4a4a4a' : '#c0c0c0'
  const text = theme === 'dark' ? '#e8e8e8' : '#1a1a1a'
  const accent = theme === 'dark' ? '#c9a96e' : '#8b6914'
  const correct = theme === 'dark' ? '#4ade80' : '#16a34a'
  const incorrect = theme === 'dark' ? '#f87171' : '#dc2626'

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [targetText])

  useEffect(() => {
    if (isComplete && onComplete) onComplete({ wpm, accuracy })
  }, [isComplete])

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      reset()
      return
    }
    handleKey(e.key)
  }

  const charColor = (status) => {
    if (status === 'correct') return correct
    if (status === 'incorrect') return incorrect
    return muted
  }

  if (!targetText) return null

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div
        className="font-mono text-2xl leading-relaxed select-none cursor-text"
        style={{ letterSpacing: '0.3px' }}
      >
        {targetText.split('').map((char, i) => (
          <span key={i} className="char relative" style={{ color: charColor(charStatuses[i]) }}>
            {i === currentIndex && !isComplete && (
              <span
                className="cursor-blink absolute"
                style={{
                  left: -1,
                  top: '4px',
                  bottom: '4px',
                  width: 2,
                  background: accent,
                  borderRadius: 1,
                }}
              />
            )}
            {char}
          </span>
        ))}
        {isComplete && (
          <span className="cursor-blink ml-0.5 inline-block" style={{ width: 2, height: '1.1em', background: accent, borderRadius: 1, verticalAlign: 'text-bottom' }} />
        )}
      </div>

      {!focused && !isComplete && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm rounded-lg"
          style={{ background: 'transparent', color: muted }}
        >
          Click to start typing
        </div>
      )}
    </div>
  )
}
