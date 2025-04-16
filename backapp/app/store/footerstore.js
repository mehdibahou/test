import {create} from 'zustand';

const useFooterStore = create((set) => ({
color:'ffffff',
setColor: (color) => set({ color: color }),

}));

export default useFooterStore;