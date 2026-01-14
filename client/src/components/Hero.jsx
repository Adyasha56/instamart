export default function Hero() {
  return (
    <section className="w-full bg-white py-10 ">
      <div className=" mx-10 px-6">
        <div className="bg-green-50 rounded-2xl px-10 py-12 flex items-center justify-center gap-10">

          {/* LEFT CONTENT */}
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-gray-900 leading-snug">
              Groceries delivered in{" "}
              <span className="text-green-500">10 minutes</span>
            </h1>

            <p className="mt-3 text-gray-600 text-base">
              Fresh fruits, vegetables, dairy & daily essentials — delivered
              fast from local stores.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <button className="bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                Shop Now
              </button>

              <button className="bg-white px-6 py-2.5 rounded-lg text-sm font-medium text-gray-800">
                Add Starter Pack
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-[340px] h-[220px] rounded-xl overflow-hidden shadow-sm">
            <img
              src="/images/groceries.jpg"
              alt="Groceries"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
