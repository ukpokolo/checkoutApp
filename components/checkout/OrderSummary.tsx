import { Product } from "@/types/payment";
import { formatToNaira } from "@/lib/utils";
import Image from "next/image";

type Props = {
  product: Product;
};

export default function OrderSummary({ product }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-md">
      {/* Product Image */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden bg-gray-50 mb-6">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Product Info */}
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
        <p className="text-sm text-gray-500">{product.description}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Price Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatToNaira(product.price)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">
          {formatToNaira(product.price)}
        </span>
      </div>
    </div>
  );
}