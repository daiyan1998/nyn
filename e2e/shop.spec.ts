import { expect, test } from "@playwright/test";

// A UK visitor: country and currency should be detected as GB / GBP.
test.use({ locale: "en-GB" });

test("choose colour → bag → checkout → order receipt", async ({ page }) => {
  await page.goto("/");

  // Pick a colour explicitly on the home page, then add.
  await page.locator('label[for="home-the-fold-brown"]').click();
  await page.getByRole("button", { name: "Add The Fold in Saddle Brown to bag" }).click();

  const drawer = page.getByRole("dialog", { name: "Your bag" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Saddle Brown")).toBeVisible();
  await expect(drawer.getByText(/away from free shipping/)).toBeVisible();
  await expect(drawer.getByText(/Ships to/)).toContainText("United Kingdom");

  await drawer.getByRole("button", { name: "Increase quantity of The Fold" }).click();
  // $36 → £28 each, ×2
  await expect(drawer.getByText("£56").first()).toBeVisible();
  await drawer.getByRole("link", { name: "Secure checkout →" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Country is preselected; UK shipping $16 → £13; total £69.
  await expect(page.getByLabel("Country", { exact: true })).toHaveValue("GB");
  await expect(page.getByRole("button", { name: "Pay £69 →" })).toBeVisible();
  await expect(page.getByText("Cash on delivery")).toHaveCount(0);

  // Field-level validation on blur.
  await page.getByLabel("Email", { exact: true }).fill("sam@");
  await page.getByLabel("Email", { exact: true }).blur();
  await expect(page.getByText(/Enter a valid email/)).toBeVisible();

  // Submitting with missing fields reports them.
  await page.getByRole("button", { name: "Pay £69 →" }).click();
  await expect(page.getByText("Enter the recipient's full name")).toBeVisible();

  await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
  await page.getByLabel("Full name").fill("Sam Taylor");
  await page.getByLabel("Street address").fill("12 Example Street");
  await page.getByLabel("Town / city").fill("London");
  await page.getByLabel("Postcode").fill("N1 9GU");
  await expect(page.getByText(/Enter a valid email/)).toHaveCount(0);

  await page.getByRole("button", { name: "Pay £69 →" }).click();
  await expect(page).toHaveURL(/\/orders\/TN-/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: /Thank you, Sam/ })).toBeVisible();
  await expect(page.getByText("Total paid")).toBeVisible();
  await expect(page.getByText("£69").first()).toBeVisible();
  await expect(page.getByText("7–12 business days").first()).toBeVisible();

  // Survives a reload; details are remembered for the next checkout.
  await page.reload();
  await expect(page.getByRole("heading", { name: /Thank you, Sam/ })).toBeVisible();
  await page.goto("/products/the-slip");
  await page.getByRole("button", { name: /^Add to bag/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("sam@example.com");
});

test("sold-out colour cannot be added", async ({ page }) => {
  await page.goto("/products/the-fold");
  await page.locator('label[for="pdp-the-fold-tan"]').click();
  await expect(page.getByText(/Sold out in this colour/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sold out" }).first()).toBeDisabled();
});

test("cash on delivery is offered only for Bangladesh", async ({ page }) => {
  await page.goto("/products/the-loop");
  await page.getByRole("button", { name: /^Add to bag/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText("Cash on delivery")).toHaveCount(0);
  await page.getByLabel("Country", { exact: true }).selectOption("BD");
  await expect(page.getByText("Cash on delivery")).toBeVisible();
});

test("currency can be switched", async ({ page, isMobile }) => {
  test.skip(isMobile, "Header currency picker is desktop-only; mobile uses the menu");
  await page.goto("/");
  await expect(page.locator("#shop").getByText("£28")).toBeVisible();
  await page.getByLabel("Currency").first().selectOption("EUR");
  await expect(page.locator("#shop").getByText("€33")).toBeVisible();
});

test("mobile menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Shop all" }).click();
  await expect(page.getByRole("heading", { name: "Choose your piece." })).toBeInViewport();
});

test("newsletter subscribes once", async ({ page }) => {
  await page.goto("/#cta");
  const email = page.getByLabel("Email address");
  await email.fill("reader@example.com");
  await page.getByRole("button", { name: "Subscribe →" }).click();
  await expect(page.getByText(/Subscribed\./)).toBeVisible();

  await email.fill("reader@example.com");
  await page.getByRole("button", { name: "Subscribe →" }).click();
  await expect(page.getByText(/already on the list/)).toBeVisible();
});

test("unknown order shows a helpful not-found message", async ({ page }) => {
  await page.goto("/orders/TN-NOPE");
  await expect(page.getByRole("heading", { name: "Order not found." })).toBeVisible();
});
