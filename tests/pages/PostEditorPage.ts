import { Page, Locator } from '@playwright/test';

export class PostEditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly excerptTextarea: Locator;
  readonly editorContent: Locator;
  readonly postTypeSelect: Locator;
  
  // Custom dropdown triggers
  readonly stateSelectButton: Locator;
  readonly organizationSelectButton: Locator;
  readonly categorySelectButton: Locator;

  // Form submission buttons
  readonly saveDraftButton: Locator;
  readonly publishButton: Locator;
  readonly cancelButton: Locator;

  // SEO modal elements
  readonly seoModalProceedButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Core Content Fields
    this.titleInput = page.locator('input[aria-label="Post Title"]');
    this.excerptTextarea = page.locator('textarea#post-excerpt');
    this.editorContent = page.locator('.ProseMirror');

    // Sidebar Widgets
    this.postTypeSelect = page.locator('label:has-text("Post Type") select');
    this.stateSelectButton = page.locator('label:has-text("State") button');
    this.organizationSelectButton = page.locator('label:has-text("Organization") button');
    this.categorySelectButton = page.locator('label:has-text("Category") button');

    // Actions
    this.saveDraftButton = page.locator('button:has-text("Save Draft")');
    this.publishButton = page.locator('button:has-text("Publish"), button:has-text("Update")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // SEO Modal
    this.seoModalProceedButton = page.locator('div.fixed.inset-0.z-50 button:not(:has-text("Go Back"))');
  }

  async gotoNewPost() {
    await this.page.goto('/author/posts/new');
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillExcerpt(excerpt: string) {
    await this.excerptTextarea.fill(excerpt);
  }

  async fillContent(content: string) {
    await this.editorContent.fill(content);
  }

  async selectPostType(type: string) {
    await this.postTypeSelect.selectOption(type);
  }

  async selectState(stateName: string) {
    await this.stateSelectButton.click();
    const searchInput = this.page.locator('label:has-text("State") input[placeholder="Search…"]');
    await searchInput.fill(stateName);
    const option = this.page.locator(`label:has-text("State") button:has-text("${stateName}")`);
    await option.click();
  }

  async selectOrganization(orgName: string) {
    await this.organizationSelectButton.click();
    const searchInput = this.page.locator('label:has-text("Organization") input[placeholder="Search…"]');
    await searchInput.fill(orgName);
    const option = this.page.locator(`label:has-text("Organization") button:has-text("${orgName}")`);
    await option.click();
  }

  async selectCategory(categoryName: string) {
    await this.categorySelectButton.click();
    const searchInput = this.page.locator('label:has-text("Category") input[placeholder="Search…"]');
    await searchInput.fill(categoryName);
    const option = this.page.locator(`label:has-text("Category") button:has-text("${categoryName}")`);
    await option.click();
  }

  async addFaq(question: string, answer: string) {
    const addFaqBtn = this.page.locator('button:has-text("Add Question")');
    await addFaqBtn.click();
    
    // Fill the last added FAQ inputs
    const lastFaqGroup = this.page.locator('div.space-y-3 > div').last();
    await lastFaqGroup.locator('input[placeholder="Question"]').fill(question);
    await lastFaqGroup.locator('textarea[placeholder="Answer"]').fill(answer);
  }

  async saveDraft() {
    await this.saveDraftButton.click();
    await this.page.waitForSelector('div.fixed.inset-0.z-50'); // Wait for SEO analysis modal
    await this.seoModalProceedButton.click();
  }

  async publish() {
    await this.publishButton.click();
    await this.page.waitForSelector('div.fixed.inset-0.z-50'); // Wait for SEO analysis modal
    await this.seoModalProceedButton.click();
  }
}
