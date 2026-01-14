import Cart from "./Cart";

export default function Navbar() {
  return (
    <header className="w-full bg-gray-50">
      <div className="mx-10 px-4 py-3 flex items-center justify-between gap-4">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="w-10 h-10 bg-green-500 text-white font-bold flex items-center justify-center rounded-lg">
            IM
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-lg">Instamart</h1>
            <p className="text-xs text-gray-500">Fresh groceries • Fast</p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-3 flex-1 max-w-3xl">

          {/* Location */}
          <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm">
            <span>📍</span>
            <span className="text-green-600 font-medium">
              Add your location
            </span>
          </button>

          {/* Search */}
          <div className="flex flex-1 bg-white rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search for fruits, snacks, ess"
              className="w-full px-4 py-2 text-sm outline-none bg-white"
            />
            <button className="bg-green-500 text-white px-5 text-sm font-medium">
              Search
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort:</span>
            <select className="bg-white rounded-lg px-2 py-2 text-sm outline-none">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 min-w-fit">
          <button className="bg-white px-4 py-2 rounded-lg text-sm">
            Login
          </button>
          
          {/* Cart Component with dynamic count */}
          <Cart />
        </div>

      </div>
    </header>
  );
}
