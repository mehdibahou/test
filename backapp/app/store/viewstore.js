import create from 'zustand';

const useViewStore = create((set) => ({
  view: 'desktop', // default to desktop view
  setView: (view) => set({ view }),
}));

export default useViewStore;
