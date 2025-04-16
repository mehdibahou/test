import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Menu', href: '#' },
  { name: 'How It Works', href: '#' },
  { name: 'Locations', href: '#' },
  { name: 'About Us', href: '#' },
]

export default function DarkKitchenHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-gray-900 w-full">
      <div className="relative isolate overflow-hidden pt-14">
        <img
          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
          alt="Dark kitchen interior"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Gradient overlays remain unchanged */}
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
              Introducing our new gourmet menu.{' '}
              <a href="#" className="font-semibold text-white">
                <span className="absolute inset-0" aria-hidden="true" />
                View menu <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Gourmet Meals, Delivered to Your Door
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Experience restaurant-quality cuisine from our state-of-the-art dark kitchens. We bring the finest flavors to your home, crafted with passion and delivered with care.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Order Now
              </a>
              <a href="#" className="text-sm font-semibold leading-6 text-white">
                View Our Kitchens <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        {/* Bottom gradient overlay remains unchanged */}
      </div>
    </div>
  )
}