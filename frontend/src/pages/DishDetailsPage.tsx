import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Loader } from "../components/ui";
import DishImage from "../components/DishImage";
import { apiGet } from "../utils/api";
import { Dish, formatPrice } from "../types/dish";
import { useFavorites } from "../hooks/useFavorites";

export default function DishDetailsPage() {
  const { id } = useParams();
  const { toggleFavorite, isFavorite, canUseFavorites } = useFavorites();
  const [dish, setDish] = React.useState<Dish | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGet<Dish>(`/dishes/${id}`)
      .then(setDish)
      .catch(() => setDish(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!dish) {
    return (
      <Card>
        <h2>Блюдо не найдено</h2>
        <Link to="/dishes">Вернуться в каталог</Link>
      </Card>
    );
  }

  return (
    <article className="dish-details">
      <div className="dish-details__image-wrap">
        <DishImage dish={dish} className="dish-details__image" loading="eager" />
      </div>
      <Card>
        {dish.category ? <span className="dish-card__category">{dish.category.name}</span> : null}
        <h2>{dish.name}</h2>
        <p className="dish-details__price">{formatPrice(dish.price)}</p>
        <p>{dish.description}</p>
        <ul className="dish-details__facts">
          <li>
            <strong>Калорийность:</strong> {dish.calories} ккал
          </li>
          <li>
            <strong>Аллергены:</strong> {dish.allergens || "не указаны"}
          </li>
        </ul>
        <div className="dish-card__actions">
          {canUseFavorites ? (
            <Button type="button" onClick={() => toggleFavorite(dish.id)}>
              {isFavorite(dish.id) ? "Убрать из избранного" : "В избранное"}
            </Button>
          ) : null}
          <Link to="/dishes" className="button button--ghost">
            Каталог
          </Link>
          <Link to="/menu" className="button button--ghost">
            Меню дня
          </Link>
        </div>
      </Card>
    </article>
  );
}
