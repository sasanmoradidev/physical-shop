export function isOfferActive(product: {
  offerPrice: number | null;
  offerStartsAt: Date | null;
  offerEndsAt: Date | null;
}) {
  const now = new Date();

  if (!product.offerPrice) return false;

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