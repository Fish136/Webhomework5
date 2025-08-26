export const mockCategories = [
  { name: "Clothing", slug: "clothing" },
  { name: "Electronics", slug: "electronics" },
  { name: "Books", slug: "books" },
]

export const mockProducts = [
  {
    title: "T-Shirt",
    description: "Soft cotton T-Shirt",
    images: ["https://via.placeholder.com/200"],
    variants: [
      { sku: "TS-RED-M", size: "M", color: "Red", price: 19.99, stock: 50 },
      { sku: "TS-BLU-L", size: "L", color: "Blue", price: 21.99, stock: 30 },
    ],
    category_slug: "clothing"
  },
  {
    title: "Headphones",
    description: "Noise cancelling wireless headphones",
    images: ["https://via.placeholder.com/200"],
    variants: [
      { sku: "HD-BLK", color: "Black", price: 99.99, stock: 20 },
    ],
    category_slug: "electronics"
  },
  {
    title: "Novel Book",
    description: "Bestseller fiction novel",
    images: ["https://via.placeholder.com/200"],
    variants: [
      { sku: "BK-001", price: 14.99, stock: 100 },
    ],
    category_slug: "books"
  },
]
