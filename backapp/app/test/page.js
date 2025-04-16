"use client";
//
import { useEffect, useState } from "react";
import {
  Search,
  Coffee,
  Home,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  LogOut,
  Trash2,
  Percent,
  Hash,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Caisse() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [priceType, setPriceType] = useState("normal");
  const [diningOption, setDiningOption] = useState("surplace");

  // Discount states
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [supplement, setSupplement] = useState(0);
  const [productDiscounts, setProductDiscounts] = useState({});

  // Clear cart function
  const clearCart = () => {
    setCartItems([]);
    setProductDiscounts({});
    setTotalDiscount(0);
    setOrderNotes("");
    setTableNumber("");
  };

  // Cache products
  const cacheProducts = async (data) => {
    if ("caches" in window) {
      try {
        const cache = await caches.open("api-cache");
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400",
          },
          status: 200,
          statusText: "OK",
        });
        await cache.put(
          window.location.origin + "/api/caisse",
          responseToCache
        );
      } catch (error) {
        console.error("Caching error:", error);
      }
    }
  };

  // Load products from cache
  const loadCachedProducts = async () => {
    try {
      const cachedResponse = await caches.match("/api/caisse");
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

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/caisse");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
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
      const response = await fetch("/api/category");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      handleCategoryClick(data[0]);
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const getPrintableContent = ({
    restaurantName,
    orderId,
    products,
    subtotal,
    totalDiscount,
    finalTotal,
    tableNumber,
    serverName,
    timestamp,
    orderNotes,
  }) => {
    const printStyles = `
      <style>
        @page {
          margin: 0;
          size: 80mm 297mm;
        }
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 10px;
          font-size: 12px;
          line-height: 1.2;
        }
        .ticket {
          width: 100%;
          max-width: 80mm;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .logo {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-info {
          margin-bottom: 10px;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        .order-info {
          margin-bottom: 10px;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .item-quantity {
          width: 30px;
        }
        .item-name {
          flex-grow: 1;
          padding: 0 5px;
        }
        .item-price {
          text-align: right;
          width: 70px;
        }
        .order-notes {
          margin: 10px 0;
          font-style: italic;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 11px;
        }
      </style>
    `;

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const calculateVAT = (amount) => {
      const vat = amount * 0.1; // 10% VAT
      return vat;
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket</title>
          ${printStyles}
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="logo">
                <img width="120" height="50" src='/bwell.png'/>
              </div>
              <div class="company-info">
                15 RUE de la rochelle<br>
                quartier racine<br>
                CASABLANCA, 21000
              </div>
              <div class="divider"></div>
              <div class="order-info">
                ${formatDate(timestamp)}<br>
                Order: ${orderId}<br>
                <strong>Table: ${tableNumber || "N/A"}</strong><br>
                Server: ${serverName}<br>
                <strong>Type: ${
                  diningOption === "surplace" ? "Sur Place" : "À Emporter"
                }</strong><br>
                <strong>${priceType === "normal" ? "" : "Glovo"}</strong>
              </div>
              <div class="divider"></div>
            </div>
            
            <div class="items">
              ${products
                .map(
                  (item) => `
                <div class="item">
                  <span class="item-quantity">${item.quantity}</span>
                  <span class="item-name">${item.name}</span>
                  <span class="item-price">${(
                    item.price * item.quantity
                  ).toFixed(2)}</span>
                </div>
                ${
                  item.discount
                    ? `
                <div class="item">
                  <span class="item-quantity"></span>
                  <span class="item-name">Discount ${item.discount}%</span>
                  <span class="item-price">-${(
                    (item.price * item.quantity * item.discount) /
                    100
                  ).toFixed(2)}</span>
                </div>
                `
                    : ""
                }
              `
                )
                .join("")}
            </div>
            
            <div class="divider"></div>
            
            ${
              orderNotes
                ? `
            <div class="order-notes">
              <strong>Notes:</strong><br>
              ${orderNotes}
            </div>
            <div class="divider"></div>
            `
                : ""
            }
            
            <div class="totals">
              <div class="item">
                <span class="item-name">Subtotal</span>
                <span class="item-price">${calculateSubtotal().toFixed(
                  2
                )}</span>
              </div>

              <div class="item">
                <span class="item-name">Supplement</span>
                <span class="item-price">${supplement.toFixed(2)}</span>
              </div>
              
              ${
                totalDiscount > 0
                  ? `
                <div class="item">
                  <span class="item-name">Order Discount ${totalDiscount}%</span>
                  <span class="item-price">-${(
                    (calculateSubtotal() * (totalDiscount / 100)).toFixed(2) /
                    100
                  ).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              
              <div class="item">
                <span class="item-name">VAT 10% (TVA)</span>
                <span class="item-price">${calculateVAT(
                  calculateTotal().toFixed(2)
                ).toFixed(2)}</span>
              </div>
              
              <div class="divider"></div>
              
              <div class="item" style="font-weight: bold; font-size: 14px;">
                <span class="item-name">Total</span>
                <span class="item-price">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="divider"></div>
              Thank you!<br>
              www.pandasushi.com<br>
              A bientôt !
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const openPrintWindow = async ({
    restaurantName,
    orderId,
    products,
    subtotal,
    totalDiscount,
    finalTotal,
    tableNumber,
    serverName,
    timestamp,
    orderNotes,
  }) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");

    if (!printWindow) {
      alert("Please allow popups to print the ticket");
      return;
    }

    const content = getPrintableContent({
      restaurantName,
      orderId,
      products,
      subtotal,
      totalDiscount,
      finalTotal,
      tableNumber,
      serverName,
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
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    } catch (error) {
      console.error("Printing failed:", error);
      printWindow.close();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((error) => console.log("SW registration failed:", error));
      }

      const handleOnlineStatus = () => {
        setIsOnline(navigator.onLine);
      };

      window.addEventListener("online", handleOnlineStatus);
      window.addEventListener("offline", handleOnlineStatus);
      setIsOnline(navigator.onLine);

      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      async function initializeProducts() {
        try {
          if (!navigator.onLine) {
            const loadedFromCache = await loadCachedProducts();
            if (!loadedFromCache) {
              setError("No cached data available offline");
            }
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
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const addToCart = (product) => {
    const price = priceType === "glovo" ? product.glovoprice : product.price;
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    setProductDiscounts((prev) => {
      const newDiscounts = { ...prev };
      delete newDiscounts[productId];
      return newDiscounts;
    });
  };

  const applyProductDiscount = (productId, discountPercentage) => {
    setProductDiscounts((prev) => ({
      ...prev,
      [productId]: Math.min(Math.max(0, discountPercentage), 100),
    }));
  };

  const calculateTotal = () => {
    const itemTotals = cartItems.map((item) => {
      const productDiscount = productDiscounts[item._id] || 0;
      const itemSubtotal = item.price * item.quantity;
      const itemDiscountAmount = itemSubtotal * (productDiscount / 100);
      return itemSubtotal - itemDiscountAmount;
    });

    const subtotal = itemTotals.reduce((sum, itemTotal) => sum + itemTotal, 0);

    return subtotal * (1 - totalDiscount / 100) + supplement;
  };

  const calculateSubtotal = () => {
    const itemTotals = cartItems.map((item) => {
      const productDiscount = productDiscounts[item._id] || 0;
      const itemSubtotal = item.price * item.quantity;
      const itemDiscountAmount = itemSubtotal * (productDiscount / 100);
      return itemSubtotal - itemDiscountAmount;
    });
    const subtotal = itemTotals.reduce((sum, itemTotal) => sum + itemTotal, 0);
    return subtotal;
  };

  const sendOrderRequest = async () => {
    const orderItems = cartItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
      discount: productDiscounts[item._id] || 0,
    }));

    const subtotal = calculateTotal();
    const total = subtotal * (1 - totalDiscount / 100);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderItems,
          subtotal,
          total,
          notes: orderNotes,
          tableNumber,
          diningOption,
          priceType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
        console.log("Order placed successfully", data);
      } else {
        console.log("Error placing order");
      }
    } catch (error) {
      console.log("Error occurred while sending order request:", error);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.category === selectedCategory._id.toString()
      )
    : products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
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

          <div className="max-w-6xl mx-auto space-y-2">
            {/* Price Type and Dining Option Selectors */}
            <div className="flex gap-4 mb-2">
              <Select
                value={diningOption}
                onValueChange={(e) => {
                  console.log(e);
                  if (e === "glovo") {
                    setPriceType(e);
                    setDiningOption(e);
                  } else {
                    setPriceType("normal");
                    setDiningOption(e);
                  }
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/test/orders";
                  }}
                >
                  Orders
                </Button>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select dining option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surplace">Sur Place</SelectItem>
                  <SelectItem value="emporte">À Emporter</SelectItem>
                  <SelectItem value="delivery">Glovo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4 p-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="relative w-36 h-16 flex-shrink-0 cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <span className="text-white text-l block font-bold text-center px-4 sm:text-sm md:text-base lg:text-l whitespace-normal">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
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
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col w-[24%] bg-white border-l border-gray-200">
        <div className="p-3 border-b border-gray-200">
          {/* Enhanced Table Number and Notes Inputs */}
          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <Hash className="h-3 w-3 text-gray-500" />
                Table Number
              </label>
              <Input
                type="text"
                placeholder="Enter table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-gray-500" />
                Order Notes
              </label>
              <Input
                placeholder="Add special instructions..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 resize-none"
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
            <>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col justify-around space-x-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-normal text-gray-900">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="font-normal">
                          {(
                            item.price *
                            item.quantity *
                            (1 - (productDiscounts[item._id] || 0) / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between space-x-2">
                      <div className="flex items-end space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Discount %"
                          className="w-24 text-sm"
                          value={productDiscounts[item._id] || ""}
                          onChange={(e) =>
                            applyProductDiscount(
                              item._id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
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
                ))}
              </div>

              {/* <Button
                variant="outline"
                className="w-full mt-6 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={clearCart}
              >
                Clear Cart
              </Button> */}
            </>
          )}
        </div>

        <div className="p-2 border-t border-gray-200 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 font-normal">Subtotal</span>
              <span className="font-normal">
                {calculateSubtotal().toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* <span className="text-gray-500 font-normal">Discount</span> */}
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  className="w-16"
                  value={totalDiscount || ""}
                  onChange={(e) =>
                    setTotalDiscount(parseFloat(e.target.value) || 0)
                  }
                />

                <span className="font-normal text-red-500">
                  -{(calculateSubtotal() * (totalDiscount / 100)).toFixed(2)}
                </span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Suppl"
                  className="w-16"
                  value={supplement || ""}
                  onChange={(e) =>
                    setSupplement(parseFloat(e.target.value) || 0)
                  }
                />
                {/* <Percent className="h-4 w-4 text-gray-400" /> */}
              </div>
              <span className="font-normal text-green-500">
                {supplement.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-normal ">
              <span>Final Total</span>
              <span className="font-normal">{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              className="w-2/3"
              size="lg"
              disabled={cartItems.length === 0}
              onClick={async () => {
                const subtotal = calculateTotal();
                const total = subtotal * (1 - totalDiscount / 100);

                await openPrintWindow({
                  restaurantName: "PANDA SUSHI",
                  orderId:
                    orderId || Math.floor(Math.random() * 100000).toString(),
                  products: cartItems.map((item) => ({
                    ...item,
                    discount: productDiscounts[item._id] || 0,
                  })),
                  subtotal,
                  totalDiscount,
                  finalTotal: total,
                  tableNumber,
                  serverName: "GHALI",
                  timestamp: new Date().toISOString(),
                  orderNotes,
                });

                await sendOrderRequest();
              }}
            >
              Checkout
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-[30%]  text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
              onClick={clearCart}
            >
              Clear Cart
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
            <SheetTitle>Your Order</SheetTitle>
          </SheetHeader>

          {/* Enhanced Mobile Table Number and Notes Inputs */}
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                Table Number
              </label>
              <Input
                type="text"
                placeholder="Enter table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                Order Notes
              </label>
              <Textarea
                placeholder="Add special instructions..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full min-h-[80px] bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto py-6">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Your cart is empty
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
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

                <Button
                  variant="outline"
                  className="w-full mt-6 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 space-y-4 pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {calculateSubtotal().toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Discount</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-28"
                    value={totalDiscount || ""}
                    onChange={(e) =>
                      setTotalDiscount(parseFloat(e.target.value) || 0)
                    }
                  />
                  <Percent className="h-4 w-4 text-gray-400" />
                </div>
                <span className="font-medium text-red-500">
                  -{(calculateTotal() * (totalDiscount / 100)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>Final Total</span>
                <span>
                  {(calculateTotal() * (1 - totalDiscount / 100)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                className="w-1/3"
                size="lg"
                disabled={cartItems.length === 0}
                onClick={async () => {
                  const subtotal = calculateTotal();
                  const total = subtotal * (1 - totalDiscount / 100);

                  await openPrintWindow({
                    restaurantName: "PANDA SUSHI",
                    orderId:
                      orderId || Math.floor(Math.random() * 100000).toString(),
                    products: cartItems.map((item) => ({
                      ...item,
                      discount: productDiscounts[item._id] || 0,
                    })),
                    subtotal,
                    totalDiscount,
                    finalTotal: total,
                    tableNumber,
                    serverName: "GHALI",
                    timestamp: new Date().toISOString(),
                    orderNotes,
                  });

                  await sendOrderRequest();
                }}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-1/4 mt-6 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* {isInstallable && (
        <Button
          onClick={handleInstallClick}
          className="fixed bottom-4 left-4 bg-blue-500 text-white"
        >
          Install App
        </Button>
      )} */}
    </div>
  );
}
