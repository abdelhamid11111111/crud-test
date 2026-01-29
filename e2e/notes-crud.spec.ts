import { test, expect } from '@playwright/test';
import { NotesPage } from './pages/NotesPage';
import { cleanupTestDB } from './helpers/db';


test.describe('Notes App - User Workflows', () => {
    // represent web page to implement actions(add, edit, delete)
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
         notesPage = new NotesPage(page)
         await notesPage.goto();
         await cleanupTestDB()
         await page.reload();
    })
    test('complete user journey: add, edit, delete', async () => {
        
        // add note
        await notesPage.addNote('one')
        await notesPage.waitForNoteToAppear('one')

        // add another note
        await notesPage.addNote('two')
        await notesPage.waitForNoteToAppear('two')

        // verify both exist
        expect(await notesPage.getNoteCount()).toBe(2)

        //edit the first note
        await notesPage.editNote('one', 'one e')
        await notesPage.waitForNoteToAppear('one e')

        // verify edit
        const editNote = await notesPage.getNoteItem('one e')
        expect(editNote).toBeVisible()

        // delete one note
        await notesPage.deleteNote('one e')
        await notesPage.waitForNoteToDisappear('one e')

        // verify only one remains
        expect(await notesPage.getNoteCount()).toBe(1)

        const existItem = await notesPage.getNoteItem('two')
        await expect(existItem).toBeVisible()

    })

    test("should handle rapid successive operation", async () => {
      // add multiple notes - addNote() already waits for appearance internally
      await notesPage.addNote("Note 1");
      await notesPage.addNote("Note 2");
      await notesPage.addNote("Note 3");

      expect(await notesPage.getNoteCount()).toBe(3);
    });

})