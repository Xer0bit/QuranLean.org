import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setTokenFromCallback } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setTokenFromCallback(token)
      navigate('/', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f0f' }}>
      <p style={{ color: '#6b6b6b' }}>Signing you in…</p>
    </div>
  )
}
