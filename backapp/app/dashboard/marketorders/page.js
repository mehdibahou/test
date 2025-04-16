"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Clock, Package, Check, FileText, X, FileDown, Plus } from 'lucide-react';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    width: '50%',
  },
  headerRight: {
    width: '50%',
    alignItems: 'flex-end',
  },
  invoiceInfo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  invoiceInfoItem: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  addressBlock: {
    marginTop: 20,
  },
  table: {
    marginTop: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    color: '#FFFFFF',
    padding: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 10,
  },
  descriptionCol: {
    width: '40%',
  },
  priceCol: {
    width: '20%',
    textAlign: 'right',
  },
  quantityCol: {
    width: '20%',
    textAlign: 'center',
  },
  totalCol: {
    width: '20%',
    textAlign: 'right',
  },
  summaryBlock: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 5,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 20,
  },
  text: {
    fontSize: 10,
    color: '#333333',
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  smallText: {
    fontSize: 8,
    color: '#666666',
  },
});

// PDF Document Component
const OrderPDF = ({ order }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Different title and number prefix based on document type
  const isFacture = order.state === "facture";
  const documentTitle = isFacture ? "FACTURE" : "BON DE COMMANDE";
  const documentPrefix = isFacture ? "Facture n°" : "Commande n°";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <Text style={pdfStyles.title}>{documentTitle}</Text>
        
        <View style={pdfStyles.headerContainer}>
          {/* Left side - Sender info */}
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.boldText}>CÉLIA NAUDIN</Text>
            <Text style={pdfStyles.text}>123-456-7890</Text>
            <Text style={pdfStyles.text}>hello@reallygreatsite.com</Text>
            <Text style={pdfStyles.text}>reallygreatsite.com</Text>
            <Text style={pdfStyles.text}>123 Anywhere St., Any City</Text>
          </View>
          
          {/* Right side - Document details */}
          <View style={pdfStyles.headerRight}>
            <View style={pdfStyles.invoiceInfo}>
              <View style={pdfStyles.invoiceInfoItem}>
                <Text style={pdfStyles.text}>{documentPrefix}{order._id}</Text>
              </View>
              <View style={pdfStyles.invoiceInfoItem}>
                <Text style={pdfStyles.text}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
            <View style={pdfStyles.addressBlock}>
              <Text style={pdfStyles.text}>À L'ATTENTION DE</Text>
              <Text style={pdfStyles.boldText}>{order.clientName || 'Client'}</Text>
              <Text style={pdfStyles.text}>{order.clientPhone || ''}</Text>
              <Text style={pdfStyles.text}>{order.clientAddress || ''}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.descriptionCol, { color: 'white' }]}>DESCRIPTION</Text>
            <Text style={[pdfStyles.priceCol, { color: 'white' }]}>PRIX</Text>
            <Text style={[pdfStyles.quantityCol, { color: 'white' }]}>QUANTITÉ</Text>
            <Text style={[pdfStyles.totalCol, { color: 'white' }]}>TOTAL</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.text, pdfStyles.descriptionCol]}>{order.productNames[index]}</Text>
              <Text style={[pdfStyles.text, pdfStyles.priceCol]}>{item.price.toFixed(2)} €</Text>
              <Text style={[pdfStyles.text, pdfStyles.quantityCol]}>{item.quantity}</Text>
              <Text style={[pdfStyles.text, pdfStyles.totalCol]}>{(item.price * item.quantity).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={pdfStyles.summaryBlock}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.text}>Sous total :</Text>
            <Text style={pdfStyles.text}>{order.total.toFixed(2)} €</Text>
          </View>
          {isFacture && (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.text}>TVA (20%) :</Text>
              <Text style={pdfStyles.text}>{(order.total * 0.2).toFixed(2)} €</Text>
            </View>
          )}
          <View style={pdfStyles.summaryTotal}>
            <Text style={pdfStyles.boldText}>TOTAL{isFacture ? ' TTC' : ''} :</Text>
            <Text style={pdfStyles.boldText}>
              {(isFacture ? order.total * 1.2 : order.total).toFixed(2)} €
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          {isFacture ? (
            <>
              <Text style={pdfStyles.text}>Paiement à l'ordre de Célia Naudin</Text>
              <Text style={pdfStyles.text}>N° de compte 0123 4567 8901 2345</Text>
              <Text style={pdfStyles.text}>Conditions de paiement: Paiement sous 30 jours</Text>
            </>
          ) : (
            <>
              <Text style={pdfStyles.text}>Bon de commande valable 30 jours</Text>
              <Text style={pdfStyles.text}>Cette commande sera confirmée après acceptation et signature</Text>
            </>
          )}
          <Text style={[pdfStyles.boldText, { marginTop: 20, textAlign: 'center' }]}>
            MERCI DE VOTRE CONFIANCE
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Status Badge Component
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

// Order Card Component
const OrderCard = ({ order }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
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
          <PDFDownloadLink
            document={<OrderPDF order={order} />}
            fileName={`${order.state === "facture" ? "facture" : "bon-de-commande"}-${order._id}.pdf`}
          >
            {({ loading }) => (
              <Button 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
        <StatusBadge status={order.status} state={order.state} />
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

// Main Component
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === "commandes") return order.state === "bon de commande";
    if (activeTab === "factures") return order.state === "facture";
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Commandes Market</h1>
        <Button
          onClick={() => window.location.href = "/market"}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="commandes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="commandes">Bons de commande</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
        </TabsList>

        {["commandes", "factures"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredOrders.map(order => (
                <OrderCard 
                  key={order._id} 
                  order={order}
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