import Link from "next/link";
import { BagButton } from "./BagButton";
import { CurrencySelect } from "./CurrencySelect";
import { MenuButton } from "./MobileMenu";

const links = [
  { href: "/#shop", label: "Shop" },
  { href: "/#parallax", label: "Craft" },
  { href: "/#materials", label: "Materials" },
  { href: "/#quote", label: "Journal" },
];

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="logo">
        Tennor &amp; Co.
      </Link>
      <nav className="site-nav" aria-label="Main">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header-actions">
        <CurrencySelect className="hide-mobile" />
        <BagButton />
        <MenuButton />
      </div>
    </header>
  );
}
