import { Product } from "@/types/payment";

export const products: Product[] = [
      {
    id: "prod_001",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium sound quality with 30-hour battery life.",
    price: 4500000, // ₦45,000 in kobo
    image: "/images/headphones.jpg",
    currency: "NGN",
  },
];

export function getProductById(id: string): Product | undefined{
    return products.find((p) => p.id ===id);
}

export const DEFAULT_PRODUCT_ID = "prod_001";