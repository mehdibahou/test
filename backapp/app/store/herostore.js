import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const HerouseStore = create(
  persist(
    (set) => ({
      hero: {
        logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600',
        headline: 'Data to enrich your online business',
        subheadline: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.',
        cta1: { text: 'Get started', href: '#' },
        cta2: { text: 'Learn more', href: '#' },
        imageUrl: 'https://images.unsplash.com/photo-1498758536662-35b82cd15e29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2102&q=80',
      },
      setHero: (newHero) => set((state) => ({
        hero: { ...state.hero, ...newHero },
      })),

      color: '#ffffff',
      setColor: (color) => set({ color }),
    }),
    {
      name: 'hero-store', // Unique name for local storage
      getStorage: () => localStorage, // Persist to localStorage
    }
  )
);

export default HerouseStore;
