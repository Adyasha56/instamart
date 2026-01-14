// import { useParams } from "react-router-dom";
// import { products } from "../data/product";

// export default function ProductPage() {
//   const { id } = useParams();
//   const product = products.find(
//     (p) => p.id === Number(id)
//   );

//   if (!product) return <div>Product not found</div>;

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-10">
//       <div className="grid md:grid-cols-2 gap-8">
//         <img
//           src={product.img}
//           className="w-full h-80 object-cover rounded-xl"
//         />

//         <div>
//           <h1 className="text-2xl font-bold mb-3">
//             {product.name}
//           </h1>
//           <p className="text-green-600 text-xl font-semibold mb-4">
//             ₹{product.price}
//           </p>
//           <button className="bg-green-500 text-white px-6 py-2 rounded-lg">
//             Add to Cart
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
