import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.png";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  collapseOnMobile?: boolean;
};

const SIZE = {
  sm: { imageWidth: 214, height: 50 },
  md: { imageWidth: 280, height: 74 },
  lg: { imageWidth: 360, height: 96 },
};

export default function BrandLogo({ href = "/", size = "sm", centered = false, collapseOnMobile = false }: BrandLogoProps) {
  const s = SIZE[size];

  return (
    <Link href={href} aria-label="SportUnlocked home" style={{ textDecoration: "none", display: "inline-flex" }}>
      <span className={collapseOnMobile ? "brand-logo brand-logo--collapse" : "brand-logo"} style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        width: s.imageWidth,
        height: s.height,
        overflow: "hidden",
        lineHeight: 1,
      }}>
        <Image
          src={logo}
          alt="SportUnlocked"
          priority={size === "sm"}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 52%" }}
        />
      </span>
    </Link>
  );
}
