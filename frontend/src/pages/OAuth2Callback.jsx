import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const OAuth2Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      login(token)
      toast.success('Successfully signed in!')
      navigate('/', { replace: true })
    } else {
      toast.error('Authentication failed. Please try again.')
      navigate('/login', { replace: true })
    }
  }, [searchParams, login, navigate])

  return (
    <div className="loading-center">
      <div className="flex flex-direction-column items-center gap-4">
        <div className="spinner" />
        <p className="text-secondary">Finalizing authentication...</p>
      </div>
    </div>
  )
}

export default OAuth2Callback
