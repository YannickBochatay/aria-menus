// @ts-check
import { test, expect } from '@playwright/test';

test('keyboard navigation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/tests/menu-list.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/<menu-list> tests/);

  await page.keyboard.press("Tab");

  const item = page.getByRole("menuitem").first();

  await expect(item).toBeFocused();
});
