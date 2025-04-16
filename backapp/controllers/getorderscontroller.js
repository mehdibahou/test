import Order from "@/models/order";
import User from "@/models/user";





export async function Getorders(req) {
    try {
      // Get orders and populate product details

      const userid = req.userId;
      const user = await User.findOne({ _id: userid })
      const restaurantId = user.restaurantId; 
      const orders = await Order.find({ restaurant: restaurantId })
        .sort({ createdAt: -1 }) // Most recent first
        .populate({
          path: 'orderItems.product',
          model: 'FoodProduct',
          select: 'name price' 
        });

        console.log(orders,"gggg")
   
      return new Response(JSON.stringify(orders), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
   
    } catch (error) {
      return new Response(JSON.stringify({message: error.message}), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
   }
   
   export async function Patchstatus(req) {
    try {
      const { id, status } = await req.json();
      
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!order) {
        return Response.json({ message: 'Order not found' }, { status: 404 });
      }
  
      return Response.json(order);
    } catch (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }
  }