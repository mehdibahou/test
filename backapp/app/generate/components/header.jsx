// HeaderExample.js
import React from 'react';
import useStore from '@/app/store/store';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import useViewStore from '@/app/store/viewstore';
import { useEffect } from 'react';
export default function HeaderExample() {
  const { logoUrl, loginHref, navItems } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const {color}=useStore()

 console.log(color);
  const { view, setView } = useViewStore((state) => ({
    view: state.view,
    setView: state.setView,
  }));

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Ensure Zustand's state has been applied
  }, []);

  if (!hydrated) {
    return   <header style={{ backgroundColor: '#ffffff' }} className="animate-pulse">
    <div className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
      <div className="flex flex-1 space-x-4">
        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
      </div>
      <div className="rounded-full h-8 w-8 bg-gray-300"></div>
      <div className="flex flex-1 justify-end">
        <div className="w-20 h-6 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  </header> // Or return a skeleton screen
  }

  return (
    <header style={{ backgroundColor: color }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex flex-1">
          {/* <div className="hidden lg:flex lg:gap-x-12"> */}
          <div className={`${view === 'mobile' ? 'hidden' : 'flex gap-x-12'}`}>
                        {navItems.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900 ">
                {item.name}
              </a>
            ))}
          </div>
          <div className={`${view==='mobile'? 'flex' :'hidden' }`}>
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <a href="#" className="-m-1.5 p-1.5">
          <span className="sr-only">Your Company</span>
          <img className="h-12 w-auto" src={logoUrl} alt="" />
        </a>
        <div className="flex flex-1 justify-end">
          <a href={loginHref} className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 left-0 z-10 w-full overflow-y-auto bg-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src={logoUrl}
                alt=""
              />
            </a>
            <div className="flex flex-1 justify-end">
              <a href={loginHref} className="text-sm font-semibold leading-6 text-gray-900">
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                {item.name}
              </a>
            ))}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
