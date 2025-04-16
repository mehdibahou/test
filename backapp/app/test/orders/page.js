"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Package, Check, Truck, X, AlertCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const getNextStates = (currentState, type) => {
  switch (currentState) {
    case "RECEIVED":
      return ["IN_PREPARATION", "CANCELLED"];
    case "IN_PREPARATION":
      return type === "surplace"
        ? ["READY_TO_SERVE", "CANCELLED"]
        : ["READY_FOR_PICKUP", "CANCELLED"];
    case "READY_TO_SERVE":
      return ["SERVED", "CANCELLED"];
    case "READY_FOR_PICKUP":
      return ["OUT_FOR_DELIVERY", "CANCELLED"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED", "FAILED_DELIVERY"];
    case "SERVED":
    case "DELIVERED":
      return ["COMPLETED"];
    default:
      return [];
  }
};

const getPrintableContent = (order) => {
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
      .status-update {
        text-align: center;
        font-weight: bold;
        margin: 10px 0;
        font-size: 14px;
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
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusDisplay = (status) => {
    if (status === "CANCELLED") {
      return "*** COMMANDE ANNULÉE ***";
    }
    const statusMap = {
      RECEIVED: "Commande Reçue",
      IN_PREPARATION: "En Préparation",
      READY_TO_SERVE: "Prêt à Servir",
      READY_FOR_PICKUP: "Prêt pour Retrait",
      SERVED: "Servi",
      COMPLETED: "Terminé",
      OUT_FOR_DELIVERY: "En Livraison",
      DELIVERED: "Livré"
    };
    return statusMap[status] || status;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket - Commande #${order._id}</title>
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
              ${formatDate(new Date())}<br>
              Commande #${order._id}<br>
              ${order.tableNumber ? `<strong>Table: ${order.tableNumber}</strong><br>` : ''}
              <strong>Type: ${
                order.type === "surplace" ? "Sur Place" : 
                order.type === "emporte" ? "À Emporter" : "Livraison"
              }</strong>
              <div class="status-update">
                Status: ${getStatusDisplay(order.status)}
              </div>
            </div>
            <div class="divider"></div>
          </div>
          
          <div class="items">
            ${order.orderItems.map((item, index) => `
              <div class="item">
                <span class="item-quantity">${item.quantity}</span>
                <span class="item-name">${order.productNames[index]}</span>
                <span class="item-price">${item.price.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="item">
              <span class="item-name">Total</span>
              <span class="item-price">${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div class="divider"></div>
            Merci de votre visite!<br>
            www.pandasushi.com<br>
            À bientôt!
          </div>
        </div>
      </body>
    </html>
  `;
};

const printTicket = async (order) => {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  
  if (!printWindow) {
    alert("Please allow popups to print the ticket");
    return;
  }

  const content = getPrintableContent(order);
  
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

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "RECEIVED":
        return "bg-blue-100 text-blue-800";
      case "IN_PREPARATION":
        return "bg-yellow-100 text-yellow-800";
      case "READY_TO_SERVE":
      case "READY_FOR_PICKUP":
        return "bg-green-100 text-green-800";
      case "SERVED":
      case "DELIVERED":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
      {status}
    </Badge>
  );
};

const OrderCard = ({ order, onUpdateStatus }) => {
  const nextStates = getNextStates(order.status, order.type);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Commande #{order._id}
          </CardTitle>
          <div className="text-sm text-gray-500">
            {order.type === "surplace"
              ? "Sur Place"
              : order.type === "emporte"
              ? "À Emporter"
              : "Livraison"}
            {order.tableNumber && ` - Table ${order.tableNumber}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => printTicket(order)}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span>
                  {item.quantity}x {order.productNames[index]}
                </span>
                <span>{item.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{order.total.toFixed(2)}€</span>
          </div>
          {nextStates.length > 0 && (
            <Select onValueChange={(value) => onUpdateStatus(order._id, value)}>
              <SelectTrigger className="w-full mt-4">
                <SelectValue placeholder="Mettre à jour le statut" />
              </SelectTrigger>
              <SelectContent>
                {nextStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        console.log(data);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "all") return order.status !== "COMPLETED" && order.status !== "CANCELLED";
    if (activeTab === "sur-place") return order.type === "surplace" && order.status !== "COMPLETED" && order.status !== "CANCELLED";
    if (activeTab === "emporte") return order.type === "emporte" && order.status !== "COMPLETED" && order.status !== "CANCELLED";
    if (activeTab === "delivery") return order.type === "delivery" && order.status !== "COMPLETED" && order.status !== "CANCELLED";
    if (activeTab === "history") return order.status === "COMPLETED" || order.status === "CANCELLED";
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-start gap-2">
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/test";
          }}
        >
          Caisse
        </Button>
        <h1 className="text-2xl font-bold mb-6">Gestion des Commandes</h1>
      </div>
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="sur-place">Sur Place</TabsTrigger>
          <TabsTrigger value="emporte">À Emporter</TabsTrigger>
          <TabsTrigger value="delivery">Livraison</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {["all", "sur-place", "emporte", "delivery", "history"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}