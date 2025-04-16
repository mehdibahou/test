import { useState } from "react";
import { useEffect } from "react";
import io from "socket.io-client";

// const socket = io("http://localhost:52388"); // Adjust the URL if needed

const products = [
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P001",
    name: "Apple",
    category: "Fruits",
    price: 1.0,
    glovoprice: 1.2,
  },
  {
    _id: "P002",
    name: "Banana",
    category: "Fruits",
    price: 0.5,
    glovoprice: 0.6,
  },
  {
    _id: "P003",
    name: "Chicken Breast",
    category: "Meat",
    price: 5.0,
    glovoprice: 5.5,
  },
  {
    _id: "P004",
    name: "Milk",
    category: "Dairy",
    price: 1.5,
    glovoprice: 1.8,
  },
  {
    _id: "P005",
    name: "Bread",
    category: "Bakery",
    price: 2.0,
    glovoprice: 2.2,
  },
];

export default function ProductTable({ setPage }) {
  // console.log("socket:", socket);
  // const [orders, setOrders] = useState([]);

  // useEffect(() => {
  //   console.log("ahmed bahou");
  //   socket.on("order", (order) => {
  //     console.log("Order received:", order);
  //     setOrders((prevOrders) => [...prevOrders, order]);
  //   });

  //   socket.on("mo", (data) => {
  //     console.log("data:", data);
  //   });
  //   socket.emit("message", "Hello from the client!");
  //   return () => {
  //     socket.off("order");
  //   };
  // }, []);

  return (
    <div className="px-2 mt-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Products
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setPage("newProduct")}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            New Product
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
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Product ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Product Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Glovo Price
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {product._id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.price}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.glovoprice}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                          <span className="sr-only"></span>
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
