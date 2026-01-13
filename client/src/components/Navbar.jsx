export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/images/gps.png" className="w-6" />
        <span className="font-semibold">Deliver to Home</span>
      </div>

      <div className="flex gap-6">
        <a href="/login" className="font-medium">Login</a>
        <a href="/signup" className="font-medium">Signup</a>
      </div>
    </nav>
  );
}
