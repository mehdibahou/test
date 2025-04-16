import create from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600',
      loginHref: '#',
      navItems: [
        { name: 'Product', href: '#' },
        { name: 'Features', href: '#' },
        { name: 'Company', href: '#' },
      ],
      color: '#ffffff',
      setColor: (color) => set({ color: color }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setLoginHref: (href) => set({ loginHref: href }),
      setNavItems: (items) => set({ navItems: items }),
      addNavItem: () => set((state) => ({
        navItems: [...state.navItems, { name: '', href: '' }]
      })),
      removeNavItem: (index) => set((state) => ({
        navItems: state.navItems.filter((_, i) => i !== index)
      })),
      updateNavItem: (index, field, value) => set((state) => {
        const updatedNavItems = [...state.navItems];
        updatedNavItems[index][field] = value;
        return { navItems: updatedNavItems };
      })
    }),
    {
      name: 'header-store', // Unique name for the storage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);



export default useStore;
