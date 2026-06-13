import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories =
    await prisma.category.findMany();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Create Product
      </h1>

      <form
        action={createProduct}
        encType="multipart/form-data"
      >
        <input
          name="title"
          placeholder="Title"
          className="border p-2 block mb-4"
        />

        <input
          name="slug"
          placeholder="Slug"
          className="border p-2 block mb-4"
        />

        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 block mb-4"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          className="border p-2 block mb-4"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          className="border p-2 block mb-4"
        />

        <select
          name="categoryId"
          className="border p-2 block mb-4"
        >
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          name="image"
          accept="image/*"
          className="border p-2 block mb-4"
        />
        <button
          className="border px-4 py-2"
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  );
}