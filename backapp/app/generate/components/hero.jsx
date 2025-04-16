import React from 'react';
import HerouseStore from '@/app/store/herostore'; 
import useViewStore from '@/app/store/viewstore'; // Ensure you import the view store
import { useEffect } from 'react';
import { useState } from 'react';

export default function HeroExample() {
  const { hero, color } = HerouseStore(state => ({
    hero: state.hero,
    color: state.color,
  }));
  
  const { view } = useViewStore(state => ({
    view: state.view,
  }));


  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Ensure Zustand's state has been applied
  }, []);

  if (!hydrated) {
    return (
      <div className="relative bg-white animate-pulse" style={{ backgroundColor: "#ffffff"}}>
        <div className={`mx-auto max-w-7xl px-6 ${view === 'mobile' ? '' : 'lg:px-8'}`}>
          <div className={`grid ${view === 'mobile' ? 'grid-cols-1' : 'lg:grid-cols-12 lg:gap-x-8'}`}>
            <div className={`relative ${view === 'mobile' ? 'pt-10' : 'lg:col-span-7 lg:pt-48'}`}>
              <div className="h-11 w-11 rounded-full bg-gray-300"></div>
              <div className={`hidden sm:mt-32 sm:flex ${view === 'mobile' ? '' : 'lg:mt-16'}`}>
                <div className="h-6 w-[80%] bg-gray-300 rounded-md"></div>
              </div>
              <div className={`mt-16 h-6 w-3/4 bg-gray-300 rounded-md ${view === 'mobile' ? 'text-4xl' : 'sm:mt-10 sm:text-6xl'}`}></div>
              <div className={`mt-4 h-6 w-2/3 bg-gray-300 rounded-md ${view === 'mobile' ? 'text-lg' : 'sm:mt-6 sm:text-lg md:text-xl'}`}></div>
              <div className={`mt-8 flex items-center gap-x-6`}>
                <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
                <div className={`h-6 w-24 bg-gray-300 rounded-md ${view === 'mobile' ? 'mt-4' : ''}`}></div>
              </div>
            </div>
            <div className={`relative ${view === 'mobile' ? 'w-full' : 'lg:col-span-5 lg:absolute lg:inset-0 lg:left-1/2 lg:mr-0 lg:ml-8'}`}>
              <div className={`aspect-[3/2] w-full bg-gray-300 object-cover ${view === 'mobile' ? '' : 'lg:aspect-auto lg:h-full'}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

console.log("hello",color)

  return (
    <div className="relative " style={{ backgroundColor: color }}>
      <div className={`mx-auto max-w-7xl px-6 ${view === 'mobile' ? '' : 'lg:px-8'}`}>
        <div className={`grid ${view === 'mobile' ? 'grid-cols-1' : 'lg:grid-cols-12 lg:gap-x-8'}`}>
          <div className={`relative ${view === 'mobile' ? 'pt-10' : 'lg:col-span-7 lg:pt-48'}`}>
            <img
              className={`h-11 ${view === 'mobile' ? '' : 'lg:hidden'}`}
              src={hero.logoUrl}
              alt="Your Company"
            />
            <div className={`hidden sm:mt-32 sm:flex ${view === 'mobile' ? '' : 'lg:mt-16'}`}>
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Anim aute id magna aliqua ad ad non deserunt sunt.{' '}
                <a href="#" className="whitespace-nowrap font-semibold text-indigo-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <h1 className={` px-4 mt-16 text-3xl font-bold tracking-tight text-gray-900 ${view === 'mobile' ? 'text-4xl' : 'sm:mt-10 sm:text-6xl'}`}>
              {hero.headline}
            </h1>
            <p className={`px-4 mt-4 text-base leading-7 text-gray-600 ${view === 'mobile' ? 'text-lg' : 'sm:mt-6 sm:text-lg md:text-xl'}`}>
              {hero.subheadline}
            </p>
            <div className={`mt-8 ${view === 'mobile' ? 'flex-col' : 'flex-row'} flex items-center gap-x-6`}>
              <a
                href={hero.cta1.href}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {hero.cta1.text}
              </a>
              <a href={hero.cta2.href} className={`text-sm font-semibold leading-6 text-gray-900 ${view === 'mobile' ? 'mt-4' : ''}`}>
                {hero.cta2.text} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className={`relative ${view === 'mobile' ? 'w-full' : 'lg:col-span-5 lg:absolute lg:inset-0 lg:left-1/2 lg:mr-0 lg:ml-8'}`}>
            <img
              className={`aspect-[3/2] w-full bg-gray-50 object-cover ${view === 'mobile' ? '' : 'lg:aspect-auto lg:h-full'}`}
              src={hero.imageUrl}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
