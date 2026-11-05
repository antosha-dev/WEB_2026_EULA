import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui";
import DishImage from "./DishImage";
import { Dish, formatPrice } from "../types/dish";

type Props = {
  dish: Dish;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  compact?: boolean;
};

export default function DishCard({
  dish,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
  compact = false
}: Props) {
  return (
    <article className={`dish-card ${compact ? "dish-card--compact" : ""}`}>
      <Link to={`/dishes/${dish.id}`} className="dish-card__image-link">
        <DishImage dish={dish} className="dish-card__image" />
      </Link>
      <div className="dish-card__body">
        <div className="dish-card__meta">
          {dish.category ? <span className="dish-card__category">{dish.category.name}</span> : null}
          <span className="dish-card__calories">{dish.calories} ккал</span>
        </div>
        <h3 className="dish-card__title">
          <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
        </h3>
        {!compact ? <p className="dish-card__desc">{dish.description}</p> : null}
        {dish.allergens ? <p className="dish-card__allergens">Аллергены: {dish.allergens}</p> : null}
        <p className="dish-card__price">{formatPrice(dish.price)}</p>
        <div className="dish-card__actions">
          <Link to={`/dishes/${dish.id}`} className="button button--ghost">
            Подробнее
          </Link>
          {showFavoriteButton && onToggleFavorite ? (
            <Button type="button" onClick={onToggleFavorite}>
              {isFavorite ? "Убрать из избранного" : "В избранное"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
