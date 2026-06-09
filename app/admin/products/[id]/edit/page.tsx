import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Edit Product
      </h1>

      <form
        action={updateProduct.bind(
          null,
          product.id
        )}
      >
        <input
          name="title"
          defaultValue={product.title}
          className="border p-2 block mb-4"
        />

        <input
          name="slug"
          defaultValue={product.slug}
          className="border p-2 block mb-4"
        />

        <textarea
          name="description"
          defaultValue={product.description}
          className="border p-2 block mb-4"
        />

        <input
          name="price"
          type="number"
          defaultValue={Number(product.price)}
          className="border p-2 block mb-4"
        />

        <input
          name="stock"
          type="number"
          defaultValue={product.stock}
          className="border p-2 block mb-4"
        />

        <button
          type="submit"
          className="border px-4 py-2"
        >
          Save
        </button>
      </form>
    </div>
  );
}