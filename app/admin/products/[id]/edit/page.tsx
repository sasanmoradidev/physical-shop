import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import { ImageManager } from "@/components/admin/image-manager";

type Props = {
  params: {
    id: string;
  };
};

export default async function EditProductPage({ params }: Props) {
  
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
    },
  });

  if (!product) return <div>Product not found</div>;

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        ویرایش محصول
      </h1>

      <form
        action={updateProduct.bind(null, product.id)}
        className="bg-white rounded-2xl shadow border p-8 space-y-8"
      >
        {/* INFO */}
        <input
          name="title"
          defaultValue={product.title}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          name="description"
          defaultValue={product.description}
          className="w-full border p-3 rounded-xl"
        />

        {/* IMAGES */}
        <section>
          <h2 className="font-bold mb-4">تصاویر</h2>

          <ImageManager
            initialImages={product.images}
            onChange={() => {}}
          />
        </section>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          ذخیره
        </button>
      </form>
    </div>
  );
}