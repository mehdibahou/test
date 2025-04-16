import create from 'zustand';

const useCartStore = create((set) => ({
  products: [],
  addProduct: (product) => set((state) => {
    const existingProduct = state.products.find(p => p._id === product._id);
    if (existingProduct) {
      return {
        products: state.products.map(p =>
          p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        )
      };
    } else {
      return { products: [...state.products, { ...product, quantity: 1 }] };
    }
  }),
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter((product) => product._id.toString() !== productId.toString())
  })),
  
  clearCart: () => set({ products: [] }),
 

  updateQuantity: (productId, quantity) => set((state) => ({
    products: state.products.map((product) =>
      product._id.toString() === productId.toString() ? { ...product, quantity } : product
    )
  })),


  getSubtotal: () => {
    return useCartStore.getState().products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

}));

export default useCartStore;
