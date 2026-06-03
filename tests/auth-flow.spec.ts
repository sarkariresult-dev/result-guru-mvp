import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import fs from 'fs';
import path from 'path';

const authFile = path.join(process.cwd(), 'playwright/.auth/user.json');

// Detect if a valid authenticated Supabase session exists
let hasAuthState = false;
try {
  if (fs.existsSync(authFile)) {
    const state = JSON.parse(fs.readFileSync(authFile, 'utf8'));
    hasAuthState = Array.isArray(state.origins) && state.origins.some(
      (o: any) => Array.isArray(o.localStorage) && o.localStorage.some((item: any) => item.name.includes('auth-token'))
    );
  }
} catch {
  hasAuthState = false;
}

test.describe('Authentication & Session Gate E2E Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('LoginPage renders all required controls', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    
    // Check Google sign-in button exists
    const googleButton = loginPage.page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();
  });

  test('Invalid login attempts trigger user-friendly error alerts', async () => {
    // Allow page hydration to complete fully under Turbopack
    await loginPage.page.waitForTimeout(1500);

    // Fill invalid credentials
    await loginPage.login('wrong-email@domain.com', 'wrongpassword123');

    // Verify error alert is displayed and contains the warning message
    // Playwright automatically retries this assertion until the text populates
    // We add a 20s timeout to allow Next.js local dev server time to compile the Server Action on the first hit
    await expect(loginPage.errorAlert).toContainText('Invalid login credentials', { timeout: 20000 });
  });

  test('Author role-based navigation boundaries', async ({ page }) => {
    if (hasAuthState) {
      // Authenticated: access dashboard directly
      await page.goto('/author');
      
      // Verify redirection or correct scoped dashboard renders
      await expect(page).toHaveURL(/.*\/author|.*\/admin/);

      const dashboardPage = new DashboardPage(page);
      
      // If logged in as author, verify sidebar restrictions
      const isAuthor = page.url().includes('/author');
      if (isAuthor) {
        await expect(dashboardPage.postsLink).toBeVisible();
        await expect(dashboardPage.storiesLink).toBeVisible();
        await expect(dashboardPage.profileLink).toBeVisible();
        
        // Admin-restricted routes should not exist in the sidebar
        await expect(dashboardPage.settingsLink).not.toBeVisible();
        await expect(dashboardPage.usersLink).not.toBeVisible();
      }
    } else {
      // Unauthenticated: accessing dashboard directly must redirect back to login
      await page.goto('/author');
      await expect(page).toHaveURL(/.*\/login/);
    }
  });
});
