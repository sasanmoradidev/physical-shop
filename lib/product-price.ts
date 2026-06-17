export type ProductPrice = {
  price: number;
  offerPrice: number | null;
  offerStartsAt: Date | null;
  offerEndsAt: Date | null;
};

export function hasActiveOffer(
  product: ProductPrice
): boolean {
  if (product.offerPrice == null) {
    return false;
  }

  const now = new Date();

  if (
    product.offerStartsAt &&
    now < product.offerStartsAt
  ) {
    return false;
  }

  if (
    product.offerEndsAt &&
    now > product.offerEndsAt
  ) {
    return false;
  }

  return true;
}

export function getFinalPrice(
  product: ProductPrice
): number {
  return hasActiveOffer(product)
    ? product.offerPrice!
    : product.price;
}

export function getDiscountPercent(
  product: ProductPrice
): number {
  if (!hasActiveOffer(product)) {
    return 0;
  }

  return Math.round(
    ((product.price - product.offerPrice!) /
      product.price) *
      100
  );
}