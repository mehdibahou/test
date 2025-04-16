import React from 'react';

const Ticket = ({ orders }) => {
  return (
    <div className="ticket">
      <h1>Ticket de Commandes</h1>
      <ul>
        {orders.map((order, index) => (
          <li key={index}>
            {order.name} - {order.quantity} x {order.price}€
          </li>
        ))}
      </ul>
      <p>Total: {orders.reduce((total, order) => total + order.price * order.quantity, 0)}€</p>
    </div>
  );
};

export default Ticket;
