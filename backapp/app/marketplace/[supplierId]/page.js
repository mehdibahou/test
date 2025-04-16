"use client";

import { useEffect, useState } from "react";
import { Search, MessageCircle, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

export default function Marketplace({ params }) {
  const supplierId = params?.supplierId;
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [supplierName, setSupplierName] = useState("");

  // Cache products
  const cacheProducts = async (data) => {
    if ("caches" in window) {
      try {
        const cache = await caches.open("api-cache");
        const cacheKey = supplierId
          ? `/api/market?supplierId=${supplierId}`
          : "/api/market";
        const responseToCache = new Response(JSON.stringify(data));
        await cache.put(window.location.origin + cacheKey, responseToCache);
      } catch (error) {
        console.error("Caching error:", error);
      }
    }
  };

  const loadCachedProducts = async () => {
    try {
      const cacheKey = supplierId
        ? `/api/market?supplierId=${supplierId}`
        : "/api/market";
      const cachedResponse = await caches.match(cacheKey);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        setProducts(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading cached products:", error);
      return false;
    }
  };

  const fetchSupplierDetails = async () => {
    if (!supplierId) return;

    try {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      if (!response.ok) throw new Error("Failed to fetch supplier details");
      const data = await response.json();
      setSupplierName(data.name);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Add supplierId to the request if available
      const url = supplierId
        ? `/api/market?supplierId=${supplierId}`
        : "/api/market";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
      await cacheProducts(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      // We could also filter categories by supplier if needed
      const url = supplierId
        ? `/api/marketcategory?supplierId=${supplierId}`
        : "/api/marketcategory";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      if (data.length > 0) {
        handleCategoryClick(data[0]);
      }
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const getPrintableContent = ({
    orderId,
    products,
    subtotal,
    timestamp,
    orderNotes,
  }) => {
    const printStyles = `
      <style>
        @page { margin: 0; size: 80mm 297mm; }
        body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; font-size: 12px; line-height: 1.2; }
        .ticket { width: 100%; max-width: 80mm; }
        .header { text-align: center; margin-bottom: 10px; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .footer { text-align: center; margin-top: 10px; font-size: 11px; }
      </style>
    `;

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const supplierText = supplierName
      ? `<div>Supplier: ${supplierName}</div>`
      : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          ${printStyles}
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="logo">Bon de commande</div>
              <div class="divider"></div>
              <div>Order: ${orderId}</div>
              <div>Date: ${formatDate(timestamp)}</div>
              ${supplierText}
            </div>
            
            <div class="items">
              ${products
                .map(
                  (item) => `
                <div class="item">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div class="divider"></div>
            
            ${
              orderNotes
                ? `
              <div class="notes">
                <strong>Notes:</strong><br>
                ${orderNotes}
              </div>
              <div class="divider"></div>
            `
                : ""
            }
            
            <div class="total">
              <div class="item">
                <strong>Total</strong>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
            </div>
            
            <div class="footer">
              <div class="divider"></div>
              Thank you for your purchase!
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const openPrintWindow = async ({
    orderId,
    products,
    subtotal,
    timestamp,
    orderNotes,
  }) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("Please allow popups to print the receipt");
      return;
    }

    const content = getPrintableContent({
      orderId,
      products,
      subtotal,
      timestamp,
      orderNotes,
    });

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();

    await new Promise((resolve) => {
      printWindow.onload = resolve;
      setTimeout(resolve, 1000);
    });

    try {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    } catch (error) {
      console.error("Printing failed:", error);
      printWindow.close();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnlineStatus = () => setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnlineStatus);
      window.addEventListener("offline", handleOnlineStatus);
      setIsOnline(navigator.onLine);

      async function initializeProducts() {
        try {
          // Fetch supplier details if we have a supplierId
          if (supplierId) {
            await fetchSupplierDetails();
          }

          if (!navigator.onLine) {
            const loadedFromCache = await loadCachedProducts();
            if (!loadedFromCache) setError("No cached data available offline");
          } else {
            await fetchProducts();
          }
        } catch (error) {
          setError(error.message);
          await loadCachedProducts();
        } finally {
          setLoading(false);
        }
      }

      initializeProducts();
      fetchCategories();

      return () => {
        window.removeEventListener("online", handleOnlineStatus);
        window.removeEventListener("offline", handleOnlineStatus);
      };
    }
  }, [supplierId]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const sendOrderRequest = async () => {
    const orderItems = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
    }));

    const total = calculateTotal();

    try {
      const response = await fetch("/api/marketorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItems,
          total,
          notes: orderNotes,
          productnames: cartItems.map((item) => item.name),
          supplierId: supplierId, // Include supplierId when submitting order
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setOrderNotes("");
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.category === selectedCategory._id.toString()
      )
    : products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleBackClick = () => {
    router.push("/suppliers");
  };

  if (typeof window === "undefined") return null;
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-5">
          {!isOnline && (
            <div className="bg-yellow-100 p-4 mb-8 rounded-lg">
              Offline Mode - Some features may be limited
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleBackClick}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Suppliers
              </Button>

              {supplierName && (
                <h1 className="text-2xl font-bold">
                  {supplierName}'s Products
                </h1>
              )}

              <div className="w-32">{/* Spacer to balance the header */}</div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4 p-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="relative w-36 h-16 flex-shrink-0 cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <span className="text-white text-l font-bold text-center px-4">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="relative w-52 h-28 flex-shrink-0 cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-bold text-center px-4">
                        {product.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col w-[24%] bg-white border-l border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-gray-500" />
                Order Notes
              </label>
              <Input
                placeholder="Add special instructions..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-around space-x-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-normal text-gray-900">{item.name}</h3>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="font-normal">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (item.quantity > 1) {
                          setCartItems((prev) =>
                            prev.map((cartItem) =>
                              cartItem._id === item._id
                                ? {
                                    ...cartItem,
                                    quantity: cartItem.quantity - 1,
                                  }
                                : cartItem
                            )
                          );
                        } else {
                          removeFromCart(item._id);
                        }
                      }}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCartItems((prev) =>
                          prev.map((cartItem) =>
                            cartItem._id === item._id
                              ? { ...cartItem, quantity: cartItem.quantity + 1 }
                              : cartItem
                          )
                        );
                      }}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-gray-200 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between font-normal">
              <span>Total</span>
              <span>{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              className="w-2/3"
              size="lg"
              disabled={cartItems.length === 0}
              onClick={async () => {
                const total = calculateTotal();

                await openPrintWindow({
                  orderId:
                    orderId || Math.floor(Math.random() * 100000).toString(),
                  products: cartItems,
                  subtotal: total,
                  timestamp: new Date().toISOString(),
                  orderNotes,
                });

                await sendOrderRequest();
                clearCart();
              }}
            >
              Checkout
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-[30%] text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
              onClick={clearCart}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Cart Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 md:hidden"
          >
            Cart ({cartItems.length})
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                Order Notes
              </label>
              <Input
                placeholder="Add special instructions..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto py-6">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-start space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.quantity > 1) {
                              setCartItems((prev) =>
                                prev.map((cartItem) =>
                                  cartItem._id === item._id
                                    ? {
                                        ...cartItem,
                                        quantity: cartItem.quantity - 1,
                                      }
                                    : cartItem
                                )
                              );
                            } else {
                              removeFromCart(item._id);
                            }
                          }}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCartItems((prev) =>
                              prev.map((cartItem) =>
                                cartItem._id === item._id
                                  ? {
                                      ...cartItem,
                                      quantity: cartItem.quantity + 1,
                                    }
                                  : cartItem
                              )
                            );
                          }}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 space-y-4 pt-4 mt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{calculateTotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <Button
                className="w-2/3"
                size="lg"
                disabled={cartItems.length === 0}
                onClick={async () => {
                  const total = calculateTotal();

                  await openPrintWindow({
                    orderId:
                      orderId || Math.floor(Math.random() * 100000).toString(),
                    products: cartItems,
                    subtotal: total,
                    timestamp: new Date().toISOString(),
                    orderNotes,
                  });

                  await sendOrderRequest();
                  clearCart();
                }}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-[30%] text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={clearCart}
              >
                Clear
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
