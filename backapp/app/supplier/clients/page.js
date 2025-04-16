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
  MapPin,
  Clock,
  Users,
  Coffee,
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
const InvoicePDF = ({ invoice, restaurant }) => {
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
          {/* Left side - Sender info */}
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.boldText}>VOTRE ENTREPRISE</Text>
            <Text style={pdfStyles.text}>123-456-7890</Text>
            <Text style={pdfStyles.text}>contact@votreentreprise.com</Text>
            <Text style={pdfStyles.text}>www.votreentreprise.com</Text>
            <Text style={pdfStyles.text}>123 Rue Principale, Ville</Text>
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
              <Text style={pdfStyles.text}>À L'ATTENTION DE</Text>
              <Text style={pdfStyles.boldText}>{restaurant.name}</Text>
              <Text style={pdfStyles.text}>{restaurant.phone}</Text>
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
            Paiement à l'ordre de Votre Entreprise
          </Text>
          <Text style={pdfStyles.text}>N° de compte 0123 4567 8901 2345</Text>
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

// Invoice Card Component
const InvoiceCard = ({ invoice, restaurant }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <div>
            <CardTitle className="text-sm font-medium">
              Facture #{invoice._id}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {new Date(invoice.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} restaurant={restaurant} />}
            fileName={`facture-${invoice._id}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading}>
                <FileDown className="h-4 w-4 mr-2" />
                {loading ? "Chargement..." : "Télécharger"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Facture
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            {invoice.items.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span>
                  {item.quantity}x {invoice.productNames[index]}
                </span>
                <span>{item.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{invoice.total.toFixed(2)}€</span>
          </div>
          {invoice.notes && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Notes:</p>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Restaurant Card Component for the list view
const RestaurantCard = ({ restaurant, onClick, isActive }) => {
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
              {restaurant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-medium">
              {restaurant.name}
            </CardTitle>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {restaurant.city}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="flex items-center gap-1">
            <Coffee className="h-3 w-3" />
            {restaurant.cuisine}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {restaurant.seatingCapacity} places
          </Badge>
          {restaurant.status === "active" ? (
            <Badge className="bg-green-100 text-green-800">Actif</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">Inactif</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Restaurant Detail View Component
const RestaurantDetail = ({ restaurant, invoices, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold">{restaurant.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  {restaurant.address}, {restaurant.city}{" "}
                  {restaurant.postalCode}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{restaurant.phone || "Non renseigné"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Coffee className="h-4 w-4 mr-2" />
                <span>Cuisine: {restaurant.cuisine}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Capacité: {restaurant.seatingCapacity} places</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  Heures d'ouverture:{" "}
                  {restaurant.openingHours || "Non renseigné"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Factures</h3>
        {invoices.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucune facture trouvée pour ce client
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                invoice={invoice}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Client Management Component
export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const router = useRouter();

  // Fetch all clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/suppliers/clients");

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des clients");
        }

        const data = await res.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch invoices for selected client
  useEffect(() => {
    if (selectedClient) {
      const fetchInvoices = async () => {
        try {
          const res = await fetch(
            `/api/suppliers/clients/${selectedClient._id}/invoices`
          );

          if (!res.ok) {
            throw new Error("Erreur lors de la récupération des factures");
          }

          const data = await res.json();
          setInvoices(data);
        } catch (error) {
          console.error("Error fetching invoices:", error);
        }
      };

      fetchInvoices();
    }
  }, [selectedClient]);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleBack = () => {
    setSelectedClient(null);
  };

  // Filter clients based on active tab
  const filteredClients = clients.filter((client) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return client.status === "active";
    if (activeTab === "inactive") return client.status === "inactive";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Chargement des clients...</p>
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
      <h1 className="text-2xl font-bold mb-6">Gestion des Clients</h1>

      {selectedClient ? (
        <RestaurantDetail
          restaurant={selectedClient}
          invoices={invoices}
          onBack={handleBack}
        />
      ) : (
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="inactive">Inactifs</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredClients.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Aucun client trouvé
                </div>
              ) : (
                filteredClients.map((client) => (
                  <RestaurantCard
                    key={client._id}
                    restaurant={client}
                    onClick={() => handleClientSelect(client)}
                    isActive={
                      selectedClient && selectedClient._id === client._id
                    }
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
