import { cn } from "../lib/utils";

const LOGO_LIGHT_BG = "/logos/auctionit-logo-light-bg.png";
const LOGO_DARK_BG = "/logos/auctionit-logo-dark-bg.png";

interface BrandIconProps {
  alt: string;
  /** Optional explicit width/height. Omit to size purely via `className`. */
  width?: number;
  height?: number;
  className?: string;
}

export function BrandIcon({ alt, width, height, className }: BrandIconProps) {
  return (
    <>
      <img
        src={LOGO_LIGHT_BG}
        alt={alt}
        width={width}
        height={height}
        className={cn(className, "dark:hidden")}
      />
      <img
        src={LOGO_DARK_BG}
        alt={alt}
        width={width}
        height={height}
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
}
