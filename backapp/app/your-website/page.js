'use client'
import { useEffect, useState } from "react";
import FinalHeader from "./components/header";
import FinalFooter from "./components/footer";
import FinalHero from "./components/hero";
import FinalProducts from "./components/products";

export default function YourWebsite() {
  const [websiteStates, setWebsiteStates] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebsiteStates = async () => {
      try {
        const response = await fetch('/api/website/getwebsite');
        if (!response.ok) {
          throw new Error('Failed to fetch website states');
        }
        const data = await response.json();
        setWebsiteStates(data[0]); // Assuming data is an array and you need the first item
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/caisse');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchWebsiteStates(), fetchProducts()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!websiteStates) return <p>No website states available</p>;

  return (
    <div className="flex flex-col justify-start items-center">
      <FinalHeader
        logoUrl={websiteStates.header?.logoUrl}
        loginHref={websiteStates.header?.loginHref}
        navItems={websiteStates.header?.navItems}
        color={websiteStates.header?.color}
      />
      <FinalHero hero={websiteStates.hero} color={websiteStates.hero?.color} />
      <FinalProducts products={products} color={websiteStates.product?.color} />
      <FinalFooter color={websiteStates.footer?.color} />
    </div>
  );
}
