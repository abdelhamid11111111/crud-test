import { Page, Locator } from '@playwright/test';

export class NotesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly noteInput: Locator;
  readonly addButton: Locator;
  readonly updateButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Notes App' });
    this.noteInput = page.getByPlaceholder('Enter a note...');
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.errorMessage = page.locator('.bg-red-100');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addNote(noteName: string) {
    await this.noteInput.fill(noteName);
    await this.addButton.click();
    // Wait for input to clear (form submission successful)
    await this.noteInput.inputValue();
    await this.page.waitForTimeout(500); // Wait for API response and DOM update
    // Then wait for the note to appear
    await this.waitForNoteToAppear(noteName);
  }

  async getNoteItem(noteName: string) {
    return this.page.locator('.bg-gray-50', { hasText: noteName });
  }

  async getAllNoteItems() {
    return this.page.locator('.bg-gray-50').all();
  }

  async getEditButton(noteName: string) {
    const noteItem = await this.getNoteItem(noteName);
    return noteItem.getByTitle('Edit');
  }

  async getDeleteButton(noteName: string) {
    const noteItem = await this.getNoteItem(noteName);
    return noteItem.getByTitle('Delete');
  }

  async editNote(oldName: string, newName: string) {
    const editButton = await this.getEditButton(oldName);
    await editButton.click();
    await this.noteInput.fill(newName);
    await this.updateButton.click();
  }

  async deleteNote(noteName: string) {
    const deleteButton = await this.getDeleteButton(noteName);
    await deleteButton.click();
  }

  async waitForNoteToAppear(noteName: string) {
    // Use getByText which is more reliable for exact text matching
    await this.page.getByText(noteName).first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForNoteToDisappear(noteName: string) {
    // Use getByText which is more reliable
    await this.page.getByText(noteName).first().waitFor({ state: 'hidden', timeout: 5000 });
  }

  async isInEditMode() {
    return await this.updateButton.isVisible();
  }

  async getInputValue() {
    return await this.noteInput.inputValue();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }

  async hasError() {
    return await this.errorMessage.isVisible();
  }

  async getNoteCount() {
    const notes = await this.getAllNoteItems();
    return notes.length;
  }
}