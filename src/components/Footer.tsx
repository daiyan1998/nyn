import Link from "next/link";
import { shopConfig } from "@/lib/config";
import { catalog } from "@/lib/data";

export async function Footer() {
  const products = await catalog.list();
  // Only show social links that are actually configured (no dead "#" links).
  const social = Object.entries(shopConfig.social).filter(([, href]) => href);
  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div className="foot-brand">
          <span className="logo">Tennor &amp; Co.</span>
          <p>
            Full-grain leather goods, hand cut and stitched in small batches in
            Dhaka. Made to be carried, not collected.
          </p>
        </div>
        <div className="foot-cols">
          <div className="foot-col">
            <h5>Shop</h5>
            <ul>
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`}>{p.category}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="foot-col">
            <h5>Studio</h5>
            <ul>
              <li>
                <Link href="/#parallax">Craft</Link>
              </li>
              <li>
                <Link href="/#materials">Materials</Link>
              </li>
              <li>
                <Link href="/#quote">Journal</Link>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Contact</h5>
            <ul>
              <li>
                <a href={`mailto:${shopConfig.email}`}>{shopConfig.email}</a>
              </li>
              <li>
                <a href={`tel:${shopConfig.phone}`}>{shopConfig.phoneDisplay}</a>
              </li>
              <li>{shopConfig.city}</li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Help</h5>
            <ul>
              <li>
                <Link href="/shipping-returns">Shipping &amp; returns</Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${shopConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>
          {social.length > 0 && (
            <div className="foot-col">
              <h5>Follow</h5>
              <ul>
                {social.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="foot-bottom">
        <span>
          © 2026 Tennor &amp; Co. All rights reserved. Handmade in Dhaka,
          shipped worldwide.
        </span>
        <span>Product photography via Unsplash contributors</span>
      </div>
    </footer>
  );
}
