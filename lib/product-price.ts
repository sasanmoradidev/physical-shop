export type ProductPrice = {
  price: number;
  offerPrice: number | null;
  offerStartsAt: Date | string | null;
  offerEndsAt: Date | string | null;
};

export function hasActiveOffer(product: ProductPrice): boolean {
  if (
    product.offerPrice == null ||
    product.offerPrice <= 0 ||
    product.offerPrice >= product.price
  ) {
    return false;
  }

  const now = new Date();
  const startsAt = product.offerStartsAt ? new Date(product.offerStartsAt) : null;
  const endsAt = product.offerEndsAt ? new Date(product.offerEndsAt) : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;

  return true;
}

export function getFinalPrice(product: ProductPrice): number {
  return hasActiveOffer(product) ? product.offerPrice! : product.price;
}

export function getDiscountPercent(product: ProductPrice): number {
  if (!hasActiveOffer(product)) return 0;
  return Math.round(((product.price - product.offerPrice!) / product.price) * 100);
}