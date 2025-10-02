import { assets } from "../../assets/assets";

export default function RatingStars({
  rating,
  parentStyles = "flex",
  imgStyles = "w-5 h-5",
}) {
  const max = Number(import.meta.env.VITE_MAX_STARS) || 5;

  return (
    <div className={parentStyles}>
      {[...Array(max)].map((_, i) => (
        <img
          key={i}
          className={imgStyles}
          src={i < rating ? assets.star : assets.star_blank}
          alt={i < rating ? "filled star" : "empty star"}
        />
      ))}
    </div>
  );
}
