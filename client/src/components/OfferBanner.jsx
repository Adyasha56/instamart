export default function OfferBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-12 bg-white">
      <div className="relative bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-6">
          <img
            src="/images/mega-loot.png"
            alt="Mega Loot Deals"
            className="h-24"
          />

          <div>
            <h3 className="text-3xl font-extrabold text-red-700">
              Flat ₹50 Off
            </h3>
            <p className="text-lg font-semibold text-black">
              Min. Order Value ₹249
            </p>

            <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-semibold">
              Shop Now
            </button>
          </div>
        </div>

        {/* RIGHT COUPON */}
        <div className="bg-white border-2 border-dashed border-red-500 rounded-xl px-6 py-4 text-center">
          <p className="text-lg font-semibold text-red-600">
            Coupon Code:
          </p>
          <p className="text-2xl font-extrabold text-black mt-1">
            DEAL50
          </p>
        </div>
      </div>
    </section>
  );
}
