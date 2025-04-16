import { ClockIcon, CurrencyDollarIcon, TruckIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Quick Delivery.',
    description:
      'Our optimized kitchen layout and delivery network ensure your food arrives hot and fresh, typically within 30 minutes of ordering.',
    icon: ClockIcon,
  },
  {
    name: 'Cost-Effective.',
    description: 'By operating without a traditional storefront, we pass the savings on to you, offering gourmet meals at competitive prices.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Wide Coverage Area.',
    description: 'Our strategically located kitchens allow us to serve a broader area, bringing great food to more neighborhoods.',
    icon: TruckIcon,
  },
]

export default function DarkKitchenFeatures() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Efficient Operations</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">A Better Dining Experience</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our dark kitchen model combines cutting-edge technology with culinary expertise to deliver 
                restaurant-quality meals directly to your doorstep, offering convenience without compromising on taste.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2432&q=80"
            alt="Dark kitchen interior"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={2432}
            height={1442}
          />
        </div>
      </div>
    </div>
  )
}