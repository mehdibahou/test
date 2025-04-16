"use client";
import HeaderExample from "./components/header";
import FooterExample from "./components/footer";
import HeroExample from "./components/hero";
import ProductsExample from "./components/products";
import usePageStore from "../store/pagestore";
import Productpage from "./components/productpage";
import useViewStore from "../store/viewstore";









export default function StoreGenerator() {
  const { visiblePage } = usePageStore();
 
 
  const { view, setView } = useViewStore((state) => ({
    view: state.view,
    setView: state.setView,
  }));


  
  

console.log(visiblePage)
  return (
    <div className={`w-full  ${view === 'mobile' ? 'phone-view' : 'desktop-view'} `}>
      {visiblePage.id === 'home' && (
        <>
          <HeaderExample />
          <HeroExample />
          <ProductsExample />
          <FooterExample />
        </>
      )}
      {visiblePage.id === 'product' && 
      <Productpage />}
    </div>
  );
}
