import { createCategory, createProduct, listCategories } from "./api"
import { mockCategories, mockProducts } from "./mockData"

export async function seedDatabase(token) {
  const existingCats = await listCategories()
  const existingSlugs = existingCats.map(c => c.slug)

  for (let cat of mockCategories) {
    if (!existingSlugs.includes(cat.slug)) {
      await createCategory(token, cat)
    }
  }

  const cats = await listCategories()

  for (let product of mockProducts) {
    const cat = cats.find(c => c.slug === product.category_slug)
    if (!cat) continue
    await createProduct(token, {
      title: product.title,
      description: product.description,
      images: product.images,
      category_id: cat._id,
      variants: product.variants,
    })
  }
}
