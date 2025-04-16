// components/CategoryCarousel.js
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const categories = [
  { name: "Hot", icon: "🔥" },
  { name: "Burger", icon: "🍔" },
  { name: "Pizza", icon: "🍕" },
  { name: "Snack", icon: "🍟" },
  { name: "Soft Drink", icon: "🥤" },
  { name: "Coffee", icon: "☕" },
  { name: "Ice Cream", icon: "🍦" },
];

const CategoryCarousel = () => {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="flex items-center space-x-4 ">
      <Button onClick={scrollLeft} variant="ghost">
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <div
        ref={carouselRef}
        className="flex overflow-x-auto space-x-4 scrollbar-hide"
      >
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 min-w-[100px] cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-sm">{category.name}</span>
          </div>
        ))}
      </div>

      <Button onClick={scrollRight} variant="ghost">
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default CategoryCarousel;
