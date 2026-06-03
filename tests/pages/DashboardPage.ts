import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebarNav: Locator;
  readonly mainContent: Locator;
  readonly headerTitle: Locator;
  
  // Scoped nav items
  readonly dashboardLink: Locator;
  readonly postsLink: Locator;
  readonly storiesLink: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly usersLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarNav = page.locator('nav[aria-label="Sidebar navigation"]');
    this.mainContent = page.locator('#main-content');
    this.headerTitle = page.locator('header h1');

    // Selectors by link content
    this.dashboardLink = this.sidebarNav.locator('a:has-text("Dashboard")');
    this.postsLink = this.sidebarNav.locator('a:has-text("Posts"), a:has-text("My Posts")');
    this.storiesLink = this.sidebarNav.locator('a:has-text("Stories")');
    this.profileLink = this.sidebarNav.locator('a:has-text("Profile")');
    this.settingsLink = this.sidebarNav.locator('a:has-text("Settings")');
    this.usersLink = this.sidebarNav.locator('a:has-text("Users")');
  }

  async navigateToPosts() {
    await this.postsLink.click();
  }

  async navigateToStories() {
    await this.storiesLink.click();
  }

  async navigateToProfile() {
    await this.profileLink.click();
  }

  async navigateToSettings() {
    await this.settingsLink.click();
  }

  async navigateToUsers() {
    await this.usersLink.click();
  }
}
