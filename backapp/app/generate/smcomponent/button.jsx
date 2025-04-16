import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import usePageStore from '@/app/store/pagestore';

const publishingOptions = [
  { id: 'home', title: "Page d'accueil", description: 'This is the home page.' },
  { id: 'product', title: 'Page de produit', description: 'This is the product page.' },
];

export default function Pagebutton() {
  const [open, setOpen] = useState(false);
  const { visiblePage, setVisiblePage } = usePageStore((state) => ({
    visiblePage: state.visiblePage,
    setVisiblePage: state.setVisiblePage,
  }));

  const selected = publishingOptions.find(option => option.id === visiblePage) || publishingOptions[0];

  const handleButtonClick = () => setOpen(!open);
  const handleOptionClick = (option) => {
    setVisiblePage(option);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleButtonClick}
        className="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 h-6 bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-semibold">{selected.title}</p>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          {publishingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left p-4 text-sm flex flex-col hover:bg-indigo-100"
            >
              <div className="flex justify-between">
                <p className={selected.id === option.id ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                {selected.id === option.id && (
                  <CheckIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                )}
              </div>
              <p className={selected.id === option.id ? 'text-indigo-600' : 'text-gray-500'}>{option.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
