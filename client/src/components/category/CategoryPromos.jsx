// @ts-nocheck
export default function CategoryPromos({ promos = [] }) {
  if (!promos.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {promos.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`promo-${i}`}
          className="rounded-lg object-cover w-full h-40"
        />
      ))}
    </div>
  );
}
