"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  FileDown,
  FileText,
  ArrowLeft,
  Phone,
  Mail,
  Package,
  Truck,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  headerLeft: {
    width: "50%",
  },
  headerRight: {
    width: "50%",
    alignItems: "flex-end",
  },
  invoiceInfo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  invoiceInfoItem: {
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  addressBlock: {
    marginTop: 20,
  },
  table: {
    marginTop: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    color: "#FFFFFF",
    padding: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 10,
  },
  descriptionCol: {
    width: "40%",
  },
  priceCol: {
    width: "20%",
    textAlign: "right",
  },
  quantityCol: {
    width: "20%",
    textAlign: "center",
  },
  totalCol: {
    width: "20%",
    textAlign: "right",
  },
  summaryBlock: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 5,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 20,
  },
  text: {
    fontSize: 10,
    color: "#333333",
  },
  boldText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  smallText: {
    fontSize: 8,
    color: "#666666",
  },
});

// Invoice PDF Component
const InvoicePDF = ({ invoice, supplier, restaurant }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <Text style={pdfStyles.title}>FACTURE</Text>

        <View style={pdfStyles.headerContainer}>
          {/* Left side - Supplier info */}
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.boldText}>
              {supplier.name.toUpperCase()}
            </Text>
            <Text style={pdfStyles.text}>{supplier.phone || "N/A"}</Text>
            <Text style={pdfStyles.text}>{supplier.email}</Text>
          </View>

          {/* Right side - Document details */}
          <View style={pdfStyles.headerRight}>
            <View style={pdfStyles.invoiceInfo}>
              <View style={pdfStyles.invoiceInfoItem}>
                <Text style={pdfStyles.text}>Facture n°{invoice._id}</Text>
              </View>
              <View style={pdfStyles.invoiceInfoItem}>
                <Text style={pdfStyles.text}>
                  {formatDate(invoice.createdAt)}
                </Text>
              </View>
            </View>
            <View style={pdfStyles.addressBlock}>
              <Text style={pdfStyles.text}>FACTURÉ À</Text>
              <Text style={pdfStyles.boldText}>{restaurant.name}</Text>
              <Text style={pdfStyles.text}>{restaurant.phone || "N/A"}</Text>
              <Text style={pdfStyles.text}>
                {restaurant.address}, {restaurant.city} {restaurant.postalCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.descriptionCol, { color: "white" }]}>
              DESCRIPTION
            </Text>
            <Text style={[pdfStyles.priceCol, { color: "white" }]}>PRIX</Text>
            <Text style={[pdfStyles.quantityCol, { color: "white" }]}>
              QUANTITÉ
            </Text>
            <Text style={[pdfStyles.totalCol, { color: "white" }]}>TOTAL</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.text, pdfStyles.descriptionCol]}>
                {invoice.productNames[index]}
              </Text>
              <Text style={[pdfStyles.text, pdfStyles.priceCol]}>
                {item.price.toFixed(2)} €
              </Text>
              <Text style={[pdfStyles.text, pdfStyles.quantityCol]}>
                {item.quantity}
              </Text>
              <Text style={[pdfStyles.text, pdfStyles.totalCol]}>
                {(item.price * item.quantity).toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={pdfStyles.summaryBlock}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.text}>Sous total :</Text>
            <Text style={pdfStyles.text}>{invoice.total.toFixed(2)} €</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.text}>TVA (20%) :</Text>
            <Text style={pdfStyles.text}>
              {(invoice.total * 0.2).toFixed(2)} €
            </Text>
          </View>
          <View style={pdfStyles.summaryTotal}>
            <Text style={pdfStyles.boldText}>TOTAL TTC :</Text>
            <Text style={pdfStyles.boldText}>
              {(invoice.total * 1.2).toFixed(2)} €
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.text}>
            Paiement à l'ordre de {supplier.name}
          </Text>
          <Text style={pdfStyles.text}>
            Conditions de paiement: Paiement sous 30 jours
          </Text>
          <Text
            style={[pdfStyles.boldText, { marginTop: 20, textAlign: "center" }]}
          >
            MERCI DE VOTRE CONFIANCE
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Order Card Component
const OrderCard = ({ order, supplier, restaurant }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <CardTitle className="text-sm font-medium">
              {order.state === "facture" ? "Facture" : "Bon de commande"} #
              {order._id}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          {order.state === "facture" && (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  invoice={order}
                  supplier={supplier}
                  restaurant={restaurant}
                />
              }
              fileName={`facture-${order._id}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {loading ? "Chargement..." : "Télécharger"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
        <Badge
          className={`${
            order.state === "facture"
              ? "bg-purple-100 text-purple-800"
              : order.status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          } flex items-center gap-1`}
        >
          {order.state === "facture" ? (
            <FileText className="h-4 w-4" />
          ) : order.status === "cancelled" ? (
            <ArrowLeft className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          {order.state === "facture" ? "Facture" : order.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            {order.items.map((item, index) => (
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

// Supplier Card Component for the list view
const SupplierCard = ({ supplier, onClick, isActive, orderCount }) => {
  return (
    <Card
      className={`mb-4 cursor-pointer transition-colors ${
        isActive ? "border-primary" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {supplier.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-medium">
              {supplier.name}
            </CardTitle>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {supplier.email}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between">
          <div className="text-xs text-gray-500 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {supplier.phone || "Non renseigné"}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {orderCount} commandes
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Supplier Detail View Component
const SupplierDetail = ({ supplier, orders, restaurant, onBack }) => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "invoices") return order.state === "facture";
    if (activeTab === "orders") return order.state === "bon de commande";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold">{supplier.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations du fournisseur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span>{supplier.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{supplier.phone || "Non renseigné"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Store className="h-4 w-4 mr-2" />
              <span>Type: Fournisseur</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="invoices">Factures</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {filteredOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Aucun document trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      supplier={supplier}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Main Supplier Management Component
export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const router = useRouter();

  // Fetch all suppliers and the restaurant's information
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch restaurant info (the authenticated restaurant)
        const resRestaurant = await fetch("/api/restaurant/profile");

        if (!resRestaurant.ok) {
          throw new Error(
            "Erreur lors de la récupération des informations du restaurant"
          );
        }

        const restaurantData = await resRestaurant.json();
        setRestaurant(restaurantData);

        // Fetch suppliers for this restaurant
        const resSuppliers = await fetch("/api/restaurant/suppliers");

        if (!resSuppliers.ok) {
          throw new Error("Erreur lors de la récupération des fournisseurs");
        }

        const suppliersData = await resSuppliers.json();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch orders for selected supplier
  useEffect(() => {
    if (selectedSupplier && restaurant) {
      const fetchOrders = async () => {
        try {
          const res = await fetch(
            `/api/restaurant/suppliers/${selectedSupplier._id}/orders`
          );

          if (!res.ok) {
            throw new Error("Erreur lors de la récupération des commandes");
          }

          const data = await res.json();
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };

      fetchOrders();
    }
  }, [selectedSupplier, restaurant]);

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleBack = () => {
    setSelectedSupplier(null);
  };

  // Count orders per supplier
  const getOrderCountBySupplier = (supplierId) => {
    return orders.filter((order) => order.supplier === supplierId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Chargement des fournisseurs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mes Fournisseurs</h1>

      {selectedSupplier ? (
        <SupplierDetail
          supplier={selectedSupplier}
          orders={orders}
          restaurant={restaurant}
          onBack={handleBack}
        />
      ) : (
        <div>
          <ScrollArea className="h-[calc(100vh-150px)]">
            {suppliers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun fournisseur trouvé
              </div>
            ) : (
              suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier._id}
                  supplier={supplier}
                  onClick={() => handleSupplierSelect(supplier)}
                  isActive={
                    selectedSupplier && selectedSupplier._id === supplier._id
                  }
                  orderCount={getOrderCountBySupplier(supplier._id)}
                />
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
