// @ts-nocheck
import { NavLink } from "react-router-dom";
import { categories } from "../data/categories";

export default function Categories() {
  return (
    <section className="w-full bg-white border-b border-gray-200">
      <div className=" mx-10 px-6">
        <div className="flex items-center gap-4 py-3">

          {/* LEFT ARROW */}
          <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            ‹
          </button>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-6 flex-1 overflow-hidden">
            {categories.map((cat, index) => (
              <NavLink
                key={index}
                to={`/category/${cat.slug}`}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2 rounded-full transition whitespace-nowrap
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`
                }
              >
                {/* ICON */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* TEXT */}
                <span className="text-sm">{cat.name}</span>

                {/* ACTIVE UNDERLINE */}
                <span className="absolute left-0 right-0 -bottom-3 h-[3px] bg-blue-600 rounded-full opacity-0 peer-active:opacity-100"></span>
              </NavLink>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            ›
          </button>

        </div>
      </div>
    </section>
  );
}
