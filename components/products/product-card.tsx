import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type ProductCardProps = {
  title: string;
  description: string;
  price: number;
  category: string;
  slug: string;
};

export function ProductCard({
  title,
  description,
  price,
  category,
  slug,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            {category}
          </p>

          <p className="mt-2">
            {description}
          </p>

          <p className="mt-4 font-bold">
            ${price}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}