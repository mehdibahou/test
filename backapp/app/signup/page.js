"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from './components/Button'
import { TextField } from './components/Fields'
import { ChevronLeft } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
   
    address: '',
    city: '',
    cuisine: ''
  })

  console.log(formData)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'owner' }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const error = await res.json()
        setError(error.message || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Title Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
              {step === 1 ? 'Create your account' : 'Restaurant details'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {step === 1 ? 'Already registered? ' : 'Step 2 of 2 · '}
              {step === 1 ? (
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              ) : (
                <button
                  onClick={handleBack}
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Back to account details
                </button>
              )}
            </p>
          </div>

          {/* Main Form */}
          <div className="mt-10 bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  variant="solid"
                  color="blue"
                  className="w-full"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <TextField
                  label="Restaurant Name"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  autoFocus
                />

              
                <TextField
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                <div className="flex gap-x-4">
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Cuisine Type"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-4">
                  {step === 2 && (
                    <Button
                      type="submit"
                      variant="solid"
                      color="blue"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}