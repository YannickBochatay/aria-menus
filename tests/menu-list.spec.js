// @ts-check
import { test, expect } from '@playwright/test';



test('keyboard navigation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/tests/menu-list.html');

  await expect(page).toHaveTitle(/<menu-list> tests/);

  const press = page.keyboard.press.bind(page.keyboard);

  await press("Tab");

  const items = page.getByRole("menuitem");

  await expect(items).toHaveCount(6);

  const firstItem = items.first();

  await expect(firstItem).toBeFocused();

  press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();

  press("ArrowDown");
  // third item is disabled
  await expect(items.nth(3)).toBeFocused();

  press("ArrowDown");
  await expect(items.nth(4)).toBeFocused();

  press("ArrowDown");
  await expect(items.nth(5)).toBeFocused();

  press("ArrowDown");
  // back to first item
  await expect(items.first()).toBeFocused();

  press("ArrowUp");
  // back to last item
  await expect(items.last()).toBeFocused();

});
