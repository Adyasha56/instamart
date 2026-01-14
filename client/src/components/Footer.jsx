import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#F0FDF4] border-t border-gray-100">

      {/* TOP FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-6 gap-10">

        {/* ALL CATEGORIES */}
        <div>
          <h3 className="font-semibold mb-4">All Categories</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Grocery</li>
            <li>Electronics</li>
            <li>Fashion</li>
            <li>Home & Lifestyle</li>
            <li>Premium Fruits</li>
            <li>Books</li>
            <li>Furniture</li>
          </ul>
        </div>

        {/* POPULAR CATEGORIES */}
        <div>
          <h3 className="font-semibold mb-4">Popular Categories</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Biscuits, Drinks & Packaged Foods</li>
            <li>Fruits & Vegetables</li>
            <li>Cooking Essentials</li>
            <li>Dairy & Bakery</li>
            <li>Personal Care</li>
            <li>Beauty</li>
            <li>Home</li>
            <li>Mom & Baby Care</li>
            <li>School, Office & Stationery</li>
          </ul>
        </div>

        {/* CUSTOMER ACCOUNT */}
        <div>
          <h3 className="font-semibold mb-4">Customer Account</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>My Account</li>
            <li>My Orders</li>
            <li>Wishlist</li>
            <li>Delivery Addresses</li>
            <li>JioMart Wallet</li>
          </ul>
        </div>

        {/* HELP & SUPPORT */}
        <div>
          <h3 className="font-semibold mb-4">Help & Support</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>About Us</li>
            <li>FAQ</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>E-waste Policy</li>
            <li>Cancellation & Return Policy</li>
            <li>Shipping & Delivery Policy</li>
            <li>AC Installation by resQ</li>
          </ul>
        </div>

        {/* CONTACT + APP */}
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold mb-4">Contact Us</h3>

          <p className="text-sm text-gray-700 mb-2">
            WhatsApp us:{" "}
            <span className="text-blue-600 font-semibold">
              70003 70003
            </span>
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Call us:{" "}
            <span className="text-blue-600 font-semibold">
              1800 890 1222
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            8:00 AM to 8:00 PM, 365 days
          </p>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Should you encounter any bugs, glitches, lack of functionality,
            delayed deliveries, billing errors or other problems on the
            website.
          </p>

          <h4 className="text-xl font-bold mb-3">Download the app</h4>
          <div className="flex gap-3">
            <img
              src="/images/google-play.png"
              alt="Google Play"
              className="h-10 cursor-pointer"
            />
            <img
              src="/images/app-store.png"
              alt="App Store"
              className="h-10 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
              🔒
            </span>
            © 2025 All rights reserved. Reliance Retail Ltd.
          </div>

          <div className="text-center md:text-right">
            Best viewed on Microsoft Edge 81+, Mozilla Firefox 75+, Safari
            5.1.5+, Google Chrome 80+
          </div>
        </div>
      </div>
    </footer>
  );
}
