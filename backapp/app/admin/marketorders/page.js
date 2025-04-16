"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Package, Check, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const getNextStates = (currentStatus, currentState) => {
  if (currentState === "bon de commande") {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered', 'cancelled'];
      case 'delivered':
        return ['completed'];
      default:
        return [];
    }
  } else {
    // Pour les factures, pas de changement d'état possible
    return [];
  }
};

const StatusBadge = ({ status, state }) => {
  const getStatusColor = (status, state) => {
    if (state === "facture") return 'bg-purple-100 text-purple-800';
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status, state) => {
    if (state === "facture") return <FileText className="h-4 w-4" />;
    
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      case 'delivered': return <Check className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Badge className={`${getStatusColor(status, state)} flex items-center gap-1`}>
      {getStatusIcon(status, state)}
      {state === "facture" ? "Facture" : status}
    </Badge>
  );
};

const OrderCard = ({ order, onUpdateStatus }) => {
  const nextStates = getNextStates(order.status, order.state);
  const router = useRouter();

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            {order.state === "facture" ? "Facture" : "Bon de commande"} #{order._id}
          </CardTitle>
          <div className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
        <StatusBadge status={order.status} state={order.state} />
        {order.state === "bon de commande" && (
          <>
        <Check onClick={
          () => {
            fetch('/api/marketorder/validate', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: order._id })
            })
            .then(res => {
              console.log(res);
              return res.json();

            }
            )
            .then(data => {
              if (data.success) {
                window.location.reload();
                onUpdateStatus(order._id, 'facture');
              }
            });

          }
        } className="h-7 w-7 text-green-500" />
        <X onClick={
          () => {
            fetch('/api/marketorder/cancel', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: order._id })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                router.reload();
                onUpdateStatus(order._id, 'cancelled');
              }
            }
            );
          }
        }

        className="h-7 w-7 text-red-500" />
        </>
        )}

        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span>{item.quantity}x {order.productNames[index]}</span>
                <span>{item.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{order.total.toFixed(2)}€</span>
          </div>
          {/* {nextStates.length > 0 && (
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
          )} */}
          {order.notes && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Notes:</p>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("commandes");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/marketorder');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      
      if (res.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "commandes") return order.state === "bon de commande" && order.status !== "cancelled";
    if (activeTab === "factures") return order.state === "facture";
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Commandes Market</h1>
      
      <Tabs defaultValue="commandes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="commandes">Bons de commande</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
        </TabsList>

        {[ "commandes", "factures"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredOrders.map(order => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Aucune commande trouvée
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}