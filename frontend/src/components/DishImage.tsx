import React from "react";
import { getDishImageUrl, type DishCategory } from "../types/dish";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=560&fit=crop";

type DishImageProps = {
  dish: {
    id: number;
    name: string;
    imageUrl?: string | null;
    category?: DishCategory;
  };
  className?: string;
  loading?: "lazy" | "eager";
};

export default function DishImage({ dish, className, loading = "lazy" }: DishImageProps) {
  const [src, setSrc] = React.useState(() => getDishImageUrl(dish));
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setSrc(getDishImageUrl(dish));
    setError(false);
  }, [dish.id, dish.imageUrl, dish.category?.name]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setSrc(DEFAULT_IMAGE);
    }
  };

  return (
    <img
      src={src}
      alt={dish.name}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
}