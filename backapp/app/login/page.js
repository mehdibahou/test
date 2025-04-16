'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './components/Button';
import { TextField } from './components/Fields';
import { Logo } from './components/Logo';
import { SlimLayout } from './components/SlimLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log("Login successful");
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        alert('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Access Your Dark Kitchen Dashboard
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        New to our culinary network?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Join our kitchen community
        </Link>{' '}
        and start cooking.
      </p>
      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-y-8">
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <Button type="submit" variant="solid" color="blue" className="w-full">
            <span>
              Enter Kitchen <span aria-hidden="true">&rarr;</span>
            </span>
          </Button>
        </div>
      </form>
    </SlimLayout>
  );
}