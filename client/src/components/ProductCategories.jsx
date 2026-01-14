// @ts-nocheck
export default function ProductCategories({
  selectedCategory,
  onSelect,
}) {
  const categories = [
    { name: "All", img: null },
    {
      name: "Fruits",
      img: "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Veggies",
      img: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Dairy",
      img: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Snacks",
      img: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Beverages",
      img: "https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Bakery",
      img: "https://images.pexels.com/photos/6605300/pexels-photo-6605300.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      name: "Furniture",
      img: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 mx-15">
      {categories.map((cat) => (
        <div
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={`min-w-[110px] bg-white rounded-xl p-3 flex flex-col items-center cursor-pointer
          ${
            selectedCategory === cat.name
              ? "ring-2 ring-blue-500"
              : "hover:shadow-sm"
          }`}
        >
          {cat.img ? (
            <img
              src={cat.img}
              className="w-12 h-12 object-cover rounded-lg"
            />
          ) : (
            <span className="font-semibold text-blue-600 mt-4">
              All
            </span>
          )}
          <p className="text-sm mt-2">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}
