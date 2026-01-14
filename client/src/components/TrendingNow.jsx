const trendingItems = [
  {
    title: "Fashion Steals",
    img: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Home & Lifestyle Zone",
    img: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Best of Electronics",
    img: "https://images.pexels.com/photos/4792719/pexels-photo-4792719.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Daily Essentials",
    img: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "BestValueBuys",
    img: "https://images.pexels.com/photos/5632388/pexels-photo-5632388.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Winter Store",
    img: "https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];


export default function TrendingNow() {
  return (
    <section className=" mx-10 px-6 py-10 bg-white">
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-6">Trending Now</h2>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {trendingItems.map((item, i) => (
          <div key={i} className="text-center cursor-pointer">
            <div className="bg-sky-100 rounded-2xl p-4 h-40 flex items-center justify-center">
              <img
                src={item.img}
                alt={item.title}
                className="max-h-full object-contain"
              />
            </div>
            <p className="mt-3 text-sm font-semibold">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
