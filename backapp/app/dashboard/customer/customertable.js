import { useState } from 'react';

const initialCustomers = [
  { customerID: 'CUST001', name: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-1234', address: '123 Elm Street, Springfield', membershipStatus: 'Active' },
  { customerID: 'CUST002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-5678', address: '456 Oak Avenue, Springfield', membershipStatus: 'Inactive' },
  // More initial customers...
];

export default function CustomerTable() {
  const [customers, setCustomers] = useState(initialCustomers);

  return (
    <div className="px-2 mt-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the customers including their name, email, phone, address, and membership status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Customer
          </button>
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
                      Customer ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Membership Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customers.map((customer) => (
                    <tr key={customer.customerID}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {customer.customerID}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.phone}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.address}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.membershipStatus}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Edit<span className="sr-only">, {customer.name}</span>
                        </a>
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
