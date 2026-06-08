import { useState, useEffect, useCallback, useRef } from 'react'

export function useTypingEngine(targetText) {
  const [typed, setTyped] = useState('')
  const [charStatuses, setCharStatuses] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(0)

  useEffect(() => {
    setTyped('')
    setCharStatuses(targetText ? new Array(targetText.length).fill('pending') : [])
    setCurrentIndex(0)
    setStartTime(null)
    setEndTime(null)
    setIsComplete(false)
    setWpm(0)
    setAccuracy(0)
  }, [targetText])

  const handleKey = useCallback((key) => {
    if (isComplete || !targetText) return

    if (key === 'Backspace') {
      if (currentIndex === 0) return
      const newIndex = currentIndex - 1
      const newStatuses = [...charStatuses]
      newStatuses[newIndex] = 'pending'
      setTyped(t => t.slice(0, -1))
      setCharStatuses(newStatuses)
      setCurrentIndex(newIndex)
      return
    }

    if (key.length !== 1) return

    const now = Date.now()
    if (!startTime) setStartTime(now)

    const expected = targetText[currentIndex]
    const newStatuses = [...charStatuses]
    newStatuses[currentIndex] = key === expected ? 'correct' : 'incorrect'
    const newTyped = typed + key
    const newIndex = currentIndex + 1

    setTyped(newTyped)
    setCharStatuses(newStatuses)
    setCurrentIndex(newIndex)

    if (newIndex === targetText.length) {
      const elapsed = (now - (startTime ?? now)) / 1000
      const correctCount = newStatuses.filter(s => s === 'correct').length
      const finalWpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0
      const finalAccuracy = Math.round((correctCount / newTyped.length) * 100)
      setEndTime(now)
      setIsComplete(true)
      setWpm(finalWpm)
      setAccuracy(finalAccuracy)
    }
  }, [targetText, isComplete, currentIndex, charStatuses, typed, startTime])

  const reset = useCallback(() => {
    setTyped('')
    setCharStatuses(targetText ? new Array(targetText.length).fill('pending') : [])
    setCurrentIndex(0)
    setStartTime(null)
    setEndTime(null)
    setIsComplete(false)
    setWpm(0)
    setAccuracy(0)
  }, [targetText])

  return { typed, charStatuses, currentIndex, isComplete, wpm, accuracy, reset, handleKey }
}
