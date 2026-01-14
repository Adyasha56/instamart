// @ts-nocheck
export default function SubCategoryBar({ items }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 overflow-x-auto flex gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="text-center cursor-pointer text-sm text-gray-700 hover:text-blue-600"
          >
            <img
              src={item.img}
              className="w-10 h-10 mx-auto mb-1 object-cover rounded-full"
            />
            <p className="whitespace-nowrap">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
