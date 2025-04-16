import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import  { useRef } from 'react';
import Ticket from './ticket';
import useCartStore from '../store/cart/cartstore';

const restaurantName = "PandaSushi";
// const order = {
//   id: 1,
//   customerName: "John Doe",
//   items: ["Burger", "Pizza"],
//   total: 30,
// };

// const products = [
//   {
//     id: 1,
//     name: 'Throwback Hip Bag',
//     href: '#',
//     color: 'Salmon',
//     price: '$90.00',
//     quantity: 1,
//     imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
//     imageAlt: 'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
//   },
//   {
//     id: 2,
//     name: 'Medium Stuff Satchel',
//     href: '#',
//     color: 'Blue',
//     price: '$32.00',
//     quantity: 1,
//     imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
//     imageAlt:
//       'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
//   },
//   // More products...
// ]


const getPrintableContent = ({ restaurantName,orderId,products,total }) => {

  return `
    <div class="border border-black p-4 max-w-md mx-auto text-center">
      <h2 class="text-xl font-bold">${restaurantName}</h2>
      <hr class="border-t border-dashed border-black my-space-2" />
      <h3 class="text-lg font-semibold">Restaurant Ticket</h3>
      <hr class="border-t border-dashed border-black my-space-2" />
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer Name:</strong> ahmed</p>
      <p><strong>Items:</strong> ${products.map((p) => p.name).join(", ")}</p>
      <p><strong>Total:</strong> ${total}</p>
    </div>
  `;
};

const openPrintWindow = ({ restaurantName, orderId,products,total }) => {
  let printWindow = window.open("", "_blank");
  printWindow.document.open();
  printWindow.document.write(
    "<html><head><title>Print Ticket</title></head><body>"
  );
  printWindow.document.write('<div style="padding: 20px;">');
  printWindow.document.write("<h2 className='text-center'>Ticket</h2>");
  printWindow.document.write("<hr>");
  // Render the ticket content
  printWindow.document.write(getPrintableContent({ restaurantName, orderId,products,total }));
  printWindow.document.write("</div></body></html>");
  printWindow.document.close();
  printWindow.print();
  printWindow.onafterprint = function () {
    printWindow.close();
    setTimeout(() => {
      let restaurantPrintWindow = window.open("", "_blank");
      restaurantPrintWindow.document.open();
      restaurantPrintWindow.document.write(
        "<html><head><title>Print Ticket - Restaurant Copy</title></head><body>"
      );
      restaurantPrintWindow.document.write('<div style="padding: 20px;">');
      restaurantPrintWindow.document.write(
        "<h1>Restaurant Copy - Restaurant Ticket</h1>"
      );
      restaurantPrintWindow.document.write("<hr>");
      restaurantPrintWindow.document.write(
        getPrintableContent({ restaurantName, order })
      );
      restaurantPrintWindow.document.write("</div></body></html>");
      restaurantPrintWindow.document.close();
      restaurantPrintWindow.print();
      restaurantPrintWindow.onafterprint = function () {
        restaurantPrintWindow.close();
      };
    }, 1000);
  };
};




export default function Cart({isopen, setisOpen}) {

  const { products, removeProduct, getSubtotal } = useCartStore();
  const [orderId, setOrderId] = useState(null);

console.log(products) 
const sendOrderRequest = async () => {
  const orderitems = products.map((product) => ({
    product: product._id,
    quantity: product.quantity,
    price: product.price,
  }));


  console.log('Order items:', orderitems);

  const Subtotal=getSubtotal()
  
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        orderitems: orderitems,
        Subtotal: Subtotal
      }),
    });

    if (response.ok) {
      // Order successfully placed
      console.log('Order placed successfully');
      const data = await response.json();
      const { orderId } = data;  
      setOrderId(orderId);    
    } else {
      // Error occurred while placing order
      console.log('Error placing order');
    }
  } catch (error) {
    console.log('Error occurred while sending order request:', error);
  }
};


return(
    <Transition show={isopen}>
      <Dialog className="relative z-10" onClose={setisOpen}>
        <TransitionChild
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 example" >
                      <div className="flex items-start justify-between">
                        <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setisOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {products?.map((product) => (
                              <li key={product.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={product.image}
                                    alt={product.imageAlt}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <a href={product.href}>{product.name}</a>
                                      </h3>
                                      <p className="ml-4">${product.price}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Qty {product.quantity}</p>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        onClick={() =>
                                         removeProduct(product._id)}>
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${getSubtotal()}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-6">
                        <a
                          href="#"
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          onClick={() => {
                            openPrintWindow({ restaurantName, orderId,products,total:getSubtotal() });
                            sendOrderRequest();
                          }} >
                          Checkout
                        </a>
                       
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => setOpen(false)}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
)
}
