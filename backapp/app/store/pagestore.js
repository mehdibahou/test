import {create} from 'zustand';

const usePageStore = create((set) => ({
  visiblePage: { id: 'home' }, // Default to home page
  setVisiblePage: (page) => set({ visiblePage: page }),
}));

export default usePageStore;
