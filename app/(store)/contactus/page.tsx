import { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/store/contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: `تماس با ما | ${siteConfig.name}`,
    description: `راه‌های ارتباطی و نشانی ${siteConfig.name}`,
  };
}

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();
  return <ContactForm config={siteConfig} />;
}