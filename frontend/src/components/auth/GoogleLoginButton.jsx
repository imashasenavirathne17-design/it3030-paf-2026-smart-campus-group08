import React, { useEffect, useRef } from 'react'
import { authAPI } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CLIENT_ID = '920464662688-t428j48754052jol1l7ta2bj21sims3o.apps.googleusercontent.com'

export default function GoogleLoginButton({ text = 'signin_with', width = '400' }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const buttonRef = useRef(null)

  const handleCredentialResponse = async (response) => {
    try {
      const data = await authAPI.googleLogin(response.credential)
      login(data)
      toast.success('Successfully logged in with Google!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Google login failed:', error)
      toast.error('Google authentication failed. Please try again.')
    }
  }

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: text,
          shape: 'pill',
          width: width,
        })
      }
    }

    // Small delay to ensure script is ready if it loaded async
    const timeout = setTimeout(initializeGoogle, 500)
    return () => clearTimeout(timeout)
  }, [text, width])

  return (
    <div 
      ref={buttonRef} 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '24px'
      }} 
    />
  )
}
