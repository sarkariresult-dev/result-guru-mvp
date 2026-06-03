import { test, expect } from '@playwright/test';
import { PostEditorPage } from './pages/PostEditorPage';
import fs from 'fs';
import path from 'path';

const authFile = path.join(process.cwd(), 'playwright/.auth/user.json');

// Only run these dashboard test cases if an authentication session was successfully generated
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

test.describe('CMS Post Editor E2E Tests', () => {
  let editorPage: PostEditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new PostEditorPage(page);
    
    if (hasAuthState) {
      await editorPage.gotoNewPost();
    }
  });

  test('Form fields and tabs mount successfully', async ({ page }) => {
    if (!hasAuthState) {
      test.skip(true, 'Skipping: No auth state file found (E2E_TEST_USER_EMAIL/PASSWORD not configured).');
      return;
    }

    // Verify Title input mounts
    await expect(editorPage.titleInput).toBeVisible();

    // Verify Sidebar panels are present
    const publishPanel = page.locator('button:has-text("Publish")');
    const taxonomyPanel = page.locator('button:has-text("Taxonomy")');
    const mediaPanel = page.locator('button:has-text("Media")');
    const seoPanel = page.locator('button:has-text("SEO")');

    await expect(publishPanel.first()).toBeVisible();
    await expect(taxonomyPanel.first()).toBeVisible();
    await expect(mediaPanel.first()).toBeVisible();
    await expect(seoPanel.first()).toBeVisible();
  });

  test('Validations prevent saving empty posts', async ({ page }) => {
    if (!hasAuthState) {
      test.skip(true, 'Skipping: No auth state. Required for protected routes.');
      return;
    }

    // Attempt to click Save Draft on blank page
    // The "Save Draft" button should be disabled when title is empty
    await expect(editorPage.saveDraftButton).toBeDisabled();
  });

  test('Fill out and save a complete post draft', async ({ page }) => {
    if (!hasAuthState) {
      test.skip(true, 'Skipping: No auth state. Required for draft creation.');
      return;
    }

    const uniqueId = Date.now().toString().slice(-6);
    const postTitle = `e2e-test-title-${uniqueId}`;
    
    // 1. Fill basic metadata
    await editorPage.fillTitle(postTitle);
    await editorPage.fillExcerpt('This is an automated E2E test post excerpt.');
    await editorPage.fillContent('<h2>Automated E2E Test Content</h2><p>This is a paragraph created during automated playwright test runs.</p>');
    
    // 2. Select Post Type
    await editorPage.selectPostType('job');

    // 3. Fill FAQ Accordion
    await editorPage.addFaq('FAQ Question 1', 'FAQ Answer 1');

    // 4. Save Draft
    // This clicks save, triggers SEO pre-save modal checks, then submits
    await editorPage.saveDraft();

    // 5. Verify redirection back to posts listing dashboard
    await expect(page).toHaveURL(/.*\/posts/);

    // 6. Verify newly created post exists in the listing table
    const postRow = page.locator(`table, div:has-text("${postTitle}")`);
    await expect(postRow.first()).toBeVisible();
  });
});
