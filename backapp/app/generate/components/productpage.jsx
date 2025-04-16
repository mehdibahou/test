import { useState } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { StarIcon } from '@heroicons/react/20/solid';
import { HeartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import useViewStore from '@/app/store/viewstore';

const product = {
  name: 'Classic Beef Burger',
  description: 'A juicy beef patty served with lettuce, tomato, and our signature sauce on a toasted bun.',
  image: '/uploads/n5r4oh.jpg', // replace with actual path if different
  price: 8.99,
  off: 10, // discount percentage
  rating: 4.5, // example rating
  images: [
    {
      id: 1,
      name: 'Main View',
      src: '/uploads/n5r4oh.jpg',
      alt: 'Classic Beef Burger with lettuce, tomato, and sauce on a toasted bun.',
    },
    // Additional image placeholders
    {
      id: 2,
      name: 'Side View',
      src: '/uploads/n5r4oh_side.jpg',
      alt: 'Side view of Classic Beef Burger showing juicy beef patty.',
    }
  ],
  colors: [
    { name: 'Classic', bgColor: 'bg-yellow-500', selectedColor: 'ring-yellow-500' },
    { name: 'Spicy', bgColor: 'bg-red-500', selectedColor: 'ring-red-500' },
  ],
  details: [
    {
      name: 'Ingredients',
      items: [
        'Beef patty',
        'Lettuce',
        'Tomato',
        'Signature sauce',
        'Toasted bun',
      ],
    },
    {
      name: 'Nutritional Info',
      items: [
        'Calories: 540 kcal',
        'Protein: 25g',
        'Carbs: 35g',
        'Fat: 32g',
      ],
    }
  ],
  createdAt: new Date('2024-08-17T13:32:00.895Z'),
  updatedAt: new Date('2024-08-17T13:32:00.895Z'),
};



function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Productpage() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { view } = useViewStore(state => ({
    view: state.view,
  }));

  return (
    <div className="bg-white">
      <div className={`mx-auto max-w-2xl px-4 py-16 ${view === 'mobile' ? '' : 'sm:px-6 sm:py-24'} lg:max-w-7xl lg:px-8`}>
        <div className={`lg:grid ${view === 'mobile' ? 'grid-cols-1' : 'lg:grid-cols-2 lg:items-start lg:gap-x-8'}`}>
          {/* Image gallery */}
          <TabGroup className={` ${view === 'mobile' ? 'flex flex-col-reverse' : ''}`}>
            {/* Image selector */}
            <div className={`mx-auto mt-6 ${view === 'mobile' ? 'block' : 'hidden'} w-full max-w-2xl lg:max-w-none`}>
              <TabList className={`grid ${view === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'} gap-6`}>
                {product.images.map((image) => (
                  <Tab
                    key={image.id}
                    className={`${view === 'mobile' ? 'hidden' : ''} relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4`}
                  >
                    {({ selected }) => (
                      <>
                        <span className="sr-only">{image.name}</span>
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img src={image.src} alt="" className="h-full w-full object-cover object-center" />
                        </span>
                        <span
                          className={classNames(
                            selected ? 'ring-indigo-500' : 'ring-transparent',
                            'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2'
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels className={`aspect-h-1 aspect-w-1 w-full ${view === 'mobile' ? 'w-full' : ''}`}>
              {product.images.map((image) => (
                <TabPanel key={image.id}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`h-full w-full object-cover object-center ${view === 'mobile' ? '' : 'sm:rounded-lg'}`}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {/* Product info */}
          <div className={`mt-10 px-4 ${view === 'mobile' ? 'sm:mt-6' : 'sm:mt-16 sm:px-0'} lg:mt-0`}>
            <h1 className={`text-3xl font-bold tracking-tight text-gray-900 ${view === 'mobile' ? 'text-2xl' : ''}`}>
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className={`text-3xl tracking-tight text-gray-900 ${view === 'mobile' ? 'text-xl' : ''}`}>
                {product.price}
              </p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={classNames(
                        product.rating > rating ? 'text-indigo-500' : 'text-gray-300',
                        'h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="sr-only">{product.rating} out of 5 stars</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div
                className={`space-y-6 text-base text-gray-700 ${view === 'mobile' ? 'text-sm' : ''}`}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            <form className="mt-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-600">Color</h3>
                <fieldset aria-label="Choose a color" className="mt-2">
                  <RadioGroup value={selectedColor} onChange={setSelectedColor} className={`flex  items-center space-x-3`}>
                    {product.colors.map((color) => (
                      <Radio
                        key={color.name}
                        value={color}
                        aria-label={color.name}
                        className={({ focus, checked }) =>
                          classNames(
                            color.selectedColor,
                            focus && checked ? 'ring ring-offset-1' : '',
                            !focus && checked ? 'ring-2' : '',
                            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
                          )
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={classNames(
                            color.bgColor,
                            'h-8 w-8 rounded-full border border-black border-opacity-10'
                          )}
                        />
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <div className={`mt-10 flex ${view === 'mobile' ? 'flex-col' : ''}`}>
                <button
                  type="submit"
                  className={`flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 ${view === 'mobile' ? 'w-full' : 'sm:w-full'}`}
                >
                  Add to bag
                </button>

                <button
                  type="button"
                  className={`ml-4 flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500 ${view === 'mobile' ? 'mt-4' : ''}`}
                >
                  <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  <span className="sr-only">Add to favorites</span>
                </button>
              </div>
            </form>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">Additional details</h2>
              <div className="divide-y divide-gray-200 border-t">
                {product.details.map((detail) => (
                  <Disclosure as="div" key={detail.name}>
                    {({ open }) => (
                      <>
                        <h3>
                          <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                            <span
                              className={classNames(open ? 'text-indigo-600' : 'text-gray-900', 'text-sm font-medium')}
                            >
                              {detail.name}
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="block h-6 w-6 text-indigo-400 group-hover:text-indigo-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </DisclosureButton>
                        </h3>
                        <DisclosurePanel as="div" className="prose prose-sm pb-6">
                          <ul role="list">
                            {detail.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
