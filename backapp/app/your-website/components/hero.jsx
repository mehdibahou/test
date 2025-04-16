import React from 'react';

export default function FinalHero({ hero, color }) {
  return (
    <div className="relative overflow-x-hidden w-screen" style={{ backgroundColor: color }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 lg:gap-x-8">
          <div className="relative lg:col-span-7 lg:pt-48 pt-10">
            <img
              className="h-11 lg:hidden max-w-full"
              src={hero.logoUrl}
              alt="Your Company"
            />
            <div className="hidden sm:mt-32 sm:flex lg:mt-16">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Anim aute id magna aliqua ad ad non deserunt sunt.{' '}
                <a href="#" className="whitespace-nowrap font-semibold text-indigo-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <h1 className="mt-16 text-3xl font-bold tracking-tight text-gray-900 sm:mt-10 sm:text-6xl px-4">
              {hero.headline}
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg md:text-xl px-4">
              {hero.subheadline}
            </p>
            <div className="mt-8 flex flex-col lg:flex-row items-center gap-x-6">
              <a
                href={hero.cta1.href}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {hero.cta1.text}
              </a>
              <a href={hero.cta2.href} className="text-sm font-semibold leading-6 text-gray-900 mt-4 lg:mt-0">
                {hero.cta2.text} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:absolute lg:inset-0 lg:left-1/2 lg:mr-0 lg:ml-8">
            <img
              className="aspect-[3/2] w-full max-w-full bg-gray-50 object-cover lg:aspect-auto lg:h-full "
              src={hero.imageUrl}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
