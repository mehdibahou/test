// const orders = [
//     { orderID: 'ORD001', customerName: 'Lindsay Walton', item: 'Burger', quantity: 2, status: 'Completed' },
//     { orderID: 'ORD002', customerName: 'Tom Cook', item: 'Pizza', quantity: 1, status: 'Pending' },
//     { orderID: 'ORD003', customerName: 'Jane Cooper', item: 'Pasta', quantity: 3, status: 'In Progress' },
//     { orderID: 'ORD004', customerName: 'John Smith', item: 'Salad', quantity: 1, status: 'Completed' },
//     { orderID: 'ORD005', customerName: 'Alice Johnson', item: 'Sandwich', quantity: 2, status: 'Pending' },
//     { orderID: 'ORD006', customerName: 'Robert Brown', item: 'Steak', quantity: 1, status: 'Completed' },
//     { orderID: 'ORD007', customerName: 'Emily Davis', item: 'Soup', quantity: 2, status: 'In Progress' },
//     { orderID: 'ORD008', customerName: 'Michael Wilson', item: 'Pizza', quantity: 1, status: 'Pending' },
//     { orderID: 'ORD009', customerName: 'Sarah Martinez', item: 'Burger', quantity: 3, status: 'Completed' },
//     { orderID: 'ORD010', customerName: 'David Lee', item: 'Pasta', quantity: 1, status: 'In Progress' },
//     { orderID: 'ORD011', customerName: 'Emma Thompson', item: 'Salad', quantity: 2, status: 'Completed' },
//     { orderID: 'ORD012', customerName: 'James Anderson', item: 'Steak', quantity: 1, status: 'Pending' },
//   ];
  import { useState } from "react";
  import { useEffect } from "react";
  // import io from 'socket.io-client';


  // const socket = io('http://localhost:52388'); // Adjust the URL if needed

  export default function Ordertable() {
    // console.log('socket:', socket);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          setOrders(data);
          console.log('data:', data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
      fetchOrders();

     
    }, []);
    
    return (
      <div className="px-2 mt-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Orders</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the orders in your restaurant including the order ID, customer name, item, quantity, and status.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            {/* <button
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add order
            </button> */}
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Order ID
                      </th>
                      {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Customer Name
                      </th> */}
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Items
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        total
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {order._id}
                        </td>
                        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">ahmed</td> */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">    {order.productNames.join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.total}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">pending</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {/* <a href="#" className="text-indigo-600 hover:text-indigo-900">
                            Edit<span className="sr-only">, {order.customerName}</span>
                          </a> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  