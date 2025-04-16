import { useState } from 'react'
import { Radio, RadioGroup } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]
const tiers = [
  {
    name: 'Basic Kitchen',
    id: 'tier-basic',
    href: '#',
    price: { monthly: '$500', annually: '$5400' },
    description: 'Essential features for small-scale dark kitchen operations.',
    features: ['Up to 50 orders/day', '2 cuisine types', 'Basic inventory management', '24/7 customer support'],
    mostPopular: false,
  },
  {
    name: 'Pro Kitchen',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$1000', annually: '$10800' },
    description: 'Advanced features for growing dark kitchen businesses.',
    features: [
      'Up to 200 orders/day',
      '5 cuisine types',
      'Advanced inventory management',
      'Priority customer support',
      'Marketing tools integration',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise Kitchen',
    id: 'tier-enterprise',
    href: '#',
    price: { monthly: '$2000', annually: '$21600' },
    description: 'Comprehensive solution for large-scale dark kitchen operations.',
    features: [
      'Unlimited orders',
      'Unlimited cuisine types',
      'AI-powered inventory optimization',
      'Dedicated account manager',
      'Advanced analytics and reporting',
      'Custom API integration',
    ],
    mostPopular: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Pricingcards() {
  const [frequency, setFrequency] = useState(frequencies[0])

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-[#0c725c]">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your dark kitchen
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Select a plan that fits your dark kitchen's needs, whether you're just starting out or running a large-scale operation.
        </p>
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
            >
              {frequencies.map((option) => (
                <Radio
                  key={option.value}
                  value={option}
                  className={({ checked }) =>
                    classNames(
                      checked ? 'bg-[#0c725c] text-white' : 'text-gray-500',
                      'cursor-pointer rounded-full px-2.5 py-1'
                    )
                  }
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'ring-2 ring-[#0c725c]' : 'ring-1 ring-gray-200',
                'rounded-3xl p-8 xl:p-10'
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'text-[#0c725c]' : 'text-gray-900',
                    'text-lg font-semibold leading-8'
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-[#0c725c]">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price[frequency.value]}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">{frequency.priceSuffix}</span>
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? 'bg-[#0c725c] text-white shadow-sm hover:bg-indigo-500'
                    : 'text-[#091b43] ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                  'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                )}
              >
                Buy plan
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-[#091b43]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      
      </div>
    </div>
  )
}