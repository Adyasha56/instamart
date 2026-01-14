// @ts-nocheck
export default function CategoryHero({ banner }) {
  return (
    <div className="w-full h-[230px] overflow-hidden rounded-lg mb-4">
      <img
        src={banner}
        alt="Category Banner"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
