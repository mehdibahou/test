import { CakeIcon, SparklesIcon, TruckIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Gourmet Quality.',
    description:
      'Our expert chefs prepare restaurant-quality meals using premium ingredients, ensuring each dish is a culinary delight.',
    icon: CakeIcon,
  },
  {
    name: 'Menu Variety.',
    description: 'From local favorites to international cuisines, our diverse menu caters to all tastes and dietary preferences.',
    icon: SparklesIcon,
  },
  {
    name: 'Efficient Delivery.',
    description: 'Our optimized kitchen layout and delivery network ensure your food arrives fresh and hot at your doorstep.',
    icon: TruckIcon,
  },
]

export default function DarkKitchenFeaturesleft() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Culinary Excellence</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Redefining Food Delivery</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Experience the fusion of culinary artistry and cutting-edge technology. Our dark kitchen model brings
                gourmet dining to your home, offering unparalleled quality and convenience.
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
          <div className="flex items-start justify-end lg:order-first">
            <img
              src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2432&q=80"
              alt="Dark kitchen interior"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
              width={2432}
              height={1442}
            />
          </div>
        </div>
      </div>
    </div>
  )
}