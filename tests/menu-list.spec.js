// @ts-check
import { test, expect } from '@playwright/test';

// Based on https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/#kbd_label

test('keyboard navigation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/tests/menu-list.html');

  const press = page.keyboard.press.bind(page.keyboard);

  let items = page.getByRole("menuitem");

  await expect(items, "menu should have 6 items").toHaveCount(6);

  await press("Tab");
  await expect(items.first(), "menu should be focused when Tab is pressed").toBeFocused();

  press("ArrowDown");
  await expect(items.nth(1), "first item should be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowDown");
  await expect(items.nth(3), "disabled item should not be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowDown");
  await expect(items.nth(4), "next item should be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowDown");
  await expect(items.nth(5), "next item should be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowDown");
  await expect(items.first(), "first item should be focused when focus is on the last item and ArrowDown is pressed").toBeFocused();

  press("ArrowUp");
  await expect(items.last(), "last item should be focused when focus is on the first item and ArrowUp is pressed").toBeFocused();

  press("ArrowUp");
  await expect(items.nth(4), "previous item should be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowDown");
  press("ArrowRight");
  items = page.getByRole("menuitem");
  await expect(items, "submenu should display when ArrowRight is pressed on an item with submenu").toHaveCount(8);
  await expect(items.nth(6), "first subitem should be focused when ArrowRight is pressed on an item with submenu").toBeFocused();

  press("ArrowDown");
  items = page.getByRole("menuitem");
  await expect(items.nth(7), "next subitem should be focused when ArrowDown is pressed").toBeFocused();

  press("ArrowLeft");
  items = page.getByRole("menuitem");
  await expect(items, "submenu should hide when ArrowLeft is pressed").toHaveCount(6);
  await expect(items.nth(5), "parent menu item should be focused when ArrowLeft is pressed").toBeFocused();

  press(" ");
  items = page.getByRole("menuitem");
  await expect(items.nth(6), "Space should have same effect than ArrowRight on item with submenu").toBeFocused();

  press("Escape");
  items = page.getByRole("menuitem");
  await expect(items, "submenu should hide when Escape is pressed").toHaveCount(6);
  
  press("Enter");
  items = page.getByRole("menuitem");
  await expect(items.nth(6), "Enter should have same effect than ArrowRight on item with submenu").toBeFocused();

  press("Escape");
  items = page.getByRole("menuitem");

  press("Home");
  await expect(items.first(), "First item should be focused when Home is pressed").toBeFocused();

  press("End");
  await expect(items.last(), "Last item should be focused when End is pressed").toBeFocused();

  press("s");
  await expect(items.first(), "Item having a name that starts with the typed character should be focused").toBeFocused();

  press("l");
  await expect(items.nth(1), "Item having a name that starts with the typed character should be focused").toBeFocused();

  press("m");
  await expect(items.nth(3), "Item having a name that starts with the typed character should be focused").toBeFocused();

  press("z");
  await expect(items.nth(3), "Focus should not move if none of the items have a name starting with the typed character").toBeFocused();
});
