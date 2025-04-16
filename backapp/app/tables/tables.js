import React, { useState } from 'react';
const tables = [
    {
      id: 1,
      shape: 'Square Table',
      seats: 4,
      status: 'Available',
      orders: [{ item: 'Burger', quantity: 2, price: 10 }, { item: 'Drink', quantity: 1, price: 5 }],
    },
    {
      id: 2,
      shape: 'Square Table',
      seats: 4,
      status: 'Occupied',
      orders: [{ item: 'Pizza', quantity: 1, price: 12 }],
    },
    {
      id: 3,
      shape: 'Square Table',
      seats: 4,
      status: 'Available',
      orders: [],
    },
    {
      id: 4,
      shape: 'Square Table',
      seats: 4,
      status: 'Reserved',
      orders: [{ item: 'Pasta', quantity: 2, price: 15 }],
    },
    {
      id: 5,
      shape: 'Square Table',
      seats: 4,
      status: 'Not Available',
      orders: [],
    },
    {
      id: 6,
      shape: 'Square Table',
      seats: 4,
      status: 'Not Available',
      orders: [{ item: 'Salad', quantity: 1, price: 8 }],
    },
    {
      id: 7,
      shape: 'Square Table',
      seats: 4,
      status: 'Available',
      orders: [{ item: 'Soda', quantity: 3, price: 6 }],
    },
    {
      id: 8,
      shape: 'Square Table',
      seats: 4,
      status: 'Available',
      orders: [{ item: 'Steak', quantity: 1, price: 20 }],
    },
    {
      id: 9,
      shape: 'Square Table',
      seats: 4,
      status: 'Not Available',
      orders: [],
    },
    // More tables...
  ];
  
function getTableColor(status) {
    if (status === 'Available') {
        return 'bg-green-500';
    } else if (status === 'Occupied') {
        return 'bg-red-500';
    } else if (status === 'Reserved') {
        return 'bg-yellow-500';
    } else {
        return 'bg-gray-500';
    }
}




  
  export default function Tables({setIsModalOpen}) {
    console.log(setIsModalOpen)
const [selectedTable, setSelectedTable] = useState(null);
const openModal = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
          <h2 className="text-xl font-bold text-gray-900">Tables</h2>
  
          <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {tables.map((table) => (
              <div key={table.id} className="relative">
                <div className="relative h-48 w-full overflow-hidden rounded-lg flex items-center justify-center  " onClick={() => openModal(table)}>
                  <div className={`relative w-16 h-16  ${getTableColor(table.status)} border-2  border-black rounded-full flex justify-center items-center p-4`}>
                    {/* Seats */}
                    <div className="absolute -left-9 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-950 rounded-full border-2  border-black"></div>
                    <div className="absolute -right-9 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-950 rounded-full border-2  border-black"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-9 w-6 h-6 bg-blue-950 rounded-full border-2  border-black"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-9 w-6 h-6 bg-blue-950 rounded-full border-2  border-black"></div>
                    <p className="text-center text-2xl font-bold text-white">{table.id}</p>
                  </div>
                </div>
                <div className="relative mt-4">
                  {/* <h3 className="text-sm font-medium text-gray-900 text-center"> {table.status}</h3> */}
                  {/* <p className="mt-1 text-sm text-gray-500">Seats: {table.seats}</p>
                  <p className="mt-1 text-sm text-gray-500">Status: {table.status}</p> */}
                </div>
                {/* <div className="mt-6">
                  <a
                    href="#"
                    className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  >
                    View Details<span className="sr-only">, {table.shape}</span>
                  </a>
                </div> */}
              </div>
            ))}
          </div>
        </div>
       
      </div>
    );
  }
  