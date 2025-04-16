import { NextResponse } from 'next/server';
import MarketOrder from '@/models/marketorder';

// import { getServerSession } from 'next-auth'; // Uncomment if you are using next-auth
// import { authOptions } from '../authOptions'; // Uncomment if you are using next-auth

export async function  SaveMarketorder(req) {
    try {
  
      // Vérifier l'authentification
    //   const session = await getServerSession(authOptions);
    //   if (!session) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }
  
      const { orderItems, total, notes,productnames } = await req.json();
  
      // Créer la nouvelle commande
      const order = new MarketOrder({
        items: orderItems,
        total,
        notes,
        productNames: productnames

      });
  
      await order.save();
  
      // Retourner la réponse
      return NextResponse.json({
        success: true,
        orderId: order.orderNumber,
        message: "Order created successfully"
      });
  
    } catch (error) {
      console.error("Order creation error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }
  }

  export async function Getmarketorders(req) {
    try {
      
      // Vérifier l'authentification
    //   const session = await getServerSession(authOptions);
    //   if (!session) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }
  
      // Récupérer les commandes du restaurant
      const orders = await MarketOrder.find()
      
      .sort({ createdAt: -1 });
  
      return NextResponse.json(orders);
  
    } catch (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }
  }


  // validqte mqrket order

  export async function ValidateMarketorder(req) {
    try {
      
      // Vérifier l'authentification
    //   const session = await getServerSession(authOptions);
    //   if (!session) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }
  
      const { orderId } = await req.json();
  
      // Mettre à jour la commande state à "facture"
      const order = await MarketOrder.findByIdAndUpdate(
        orderId,
        { state: "facture" },
        { new: true }
      );
  
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: "Order validated successfully"
      });
  
    } catch (error) {
      console.error("Error validating order:", error);
      return NextResponse.json(
        { error: "Failed to validate order" },
        { status: 500 }
      );
    }
  }


  // cancel market order

  export async function CancelMarketorder(req) {

    try {
      
      // Vérifier l'authentification
    //   const session = await getServerSession(authOptions);
    //   if (!session) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }
  
      const { orderId } = await req.json();
  
      // Mettre à jour la commande state à "facture"
      const order = await MarketOrder.findByIdAndUpdate(
        orderId,
        { status: "cancelled" },
        { new: true }
      );
  
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully"
      });
  
    } catch (error) {
      console.error("Error cancelling order:", error);
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 }
      );
    }
  }

  // udpate market order

  export async function UpdateMarketorder(req) {

    try {
      
      // Vérifier l'authentification
    //   const session = await getServerSession(authOptions);
    //   if (!session) {
    //     return NextResponse.json(
    //       { error: "Authentication required" },
    //       { status: 401 }
    //     );
    //   }
  
      const { orderId, orderItems, total, notes,productnames } = await req.json();
  
      // Mettre à jour la commande
      const order = await MarketOrder.findByIdAndUpdate(
        orderId,
        { items: orderItems, total, notes, productNames: productnames },
        { new: true }
      );
  
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: "Order updated successfully"
      });
  
    } catch (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }
  }
  