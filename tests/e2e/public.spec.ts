import { expect, test } from "@playwright/test";

test("privacy choices fit a small screen and can be reopened without floating controls", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/privacy");
  const dialog = page.getByRole("dialog", { name: "Nastavení soukromí" });
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Pouze nezbytné" }).click();
  await expect(dialog).not.toBeVisible();
  const trigger = page.getByRole("button", { name: "Soukromí", exact: true });
  await expect(trigger).toHaveCSS("position", "static");
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("public landing has a single primary heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

for (const path of ["/privacy", "/tos"]) {
  test(`${path} is usable at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await expect(page.getByText("Obsah dokumentu")).toBeVisible();
  });
}
