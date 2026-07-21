import { expect, test } from '@playwright/test';

test('homepage supports a complete assessment journey entry', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Make security risk easier to see',
  );
  await page
    .getByRole('link', { name: /Request a security assessment/i })
    .first()
    .click();
  await expect(page).toHaveURL(/request-assessment/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Start with the decision');
});

test('mobile navigation is keyboard and touch accessible', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await page.getByRole('link', { name: 'Cloud Security' }).click();
    await expect(page).toHaveURL(/services\/cloud-security/);
  } else {
    const menu = page.getByRole('button', { name: 'Services' });
    await menu.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('region', { name: 'services menu' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
});

test('public routes do not have placeholder hrefs or horizontal overflow', async ({ page }) => {
  for (const path of [
    '/',
    '/services',
    '/solutions',
    '/industries',
    '/about',
    '/trust',
    '/insights',
    '/careers',
    '/contact',
    '/legal/privacy',
  ]) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    expect(await page.locator('a[href="#"], a:not([href])').count()).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
  }
});
