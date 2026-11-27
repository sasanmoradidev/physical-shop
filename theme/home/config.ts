export type HeroSlide = {
  id: string;
  image: string;
  title: string;
  link: string;
};

export type BannerItem = {
  id: string;
  image: string;
  alt: string;
  link: string;
};

export type OfferBannerConfig = {
  enabled: boolean;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
};

export type LightBannerConfig = {
  enabled: boolean;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  link: string;
};

export type HomeConfig = {
  heroSlides: HeroSlide[];
  showFirstFourCol: boolean;
  firstFourCol: BannerItem[];
  offerSection: OfferBannerConfig;
  showSecondFourCol: boolean;
  secondFourCol: BannerItem[];
  showNewProducts: boolean;
  lightBanner: LightBannerConfig;
};

export const defaultHomeConfig: HomeConfig = {
  heroSlides: [
    { id: "slide-1", image: "/uploads/slide01.jpg", title: "اسلاید ۱", link: "" },
    { id: "slide-2", image: "/uploads/slide02.jpg", title: "اسلاید ۲", link: "" },
    { id: "slide-3", image: "/uploads/slide03.jpg", title: "اسلاید ۳", link: "" },
  ],
  showFirstFourCol: true,
  firstFourCol: [
    { id: "fc1-1", image: "/uploads/offercol4-1.webp", alt: "بنر ۱", link: "#" },
    { id: "fc1-2", image: "/uploads/offercol4-2.webp", alt: "بنر ۲", link: "#" },
    { id: "fc1-3", image: "/uploads/offercol4-3.webp", alt: "بنر ۳", link: "#" },
    { id: "fc1-4", image: "/uploads/offercol4-4.webp", alt: "بنر ۴", link: "#" },
  ],
  offerSection: {
    enabled: true,
    image: "/uploads/offer02.jpg",
    badge: "تا ۵۰٪ تخفیف",
    title: "جشنواره تابستانه",
    subtitle: "فقط تا پایان امروز فرصت داری؛ دست بجنبان!",
    buttonText: "مشاهده محصولات",
    buttonLink: "/products",
  },
  showSecondFourCol: true,
  secondFourCol: [
    { id: "fc2-1", image: "/uploads/offercol4-1.webp", alt: "بنر ۱", link: "#" },
    { id: "fc2-2", image: "/uploads/offercol4-2.webp", alt: "بنر ۲", link: "#" },
    { id: "fc2-3", image: "/uploads/offercol4-3.webp", alt: "بنر ۳", link: "#" },
    { id: "fc2-4", image: "/uploads/offercol4-4.webp", alt: "بنر ۴", link: "#" },
  ],
  showNewProducts: true,
  lightBanner: {
    enabled: true,
    desktopImage: "/uploads/lightbanner01.jpg",
    mobileImage: "/uploads/lightbanner02.webp",
    alt: "بنر تبلیغاتی",
    link: "#",
  },
};