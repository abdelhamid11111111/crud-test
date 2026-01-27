import { NextRequest } from 'next/server';
import { GET as getItems, POST as createItem } from '../../app/api/item/route'
import { GET as getItem, PUT as updateItem, DELETE as deleteItem } from '../../app/api/item/[id]/route'
import { setupTestDatabase, cleanupTestDatabase, closeTestDatabase } from "../../lib/testDb";


describe('API Integration Tests', () => {

    // setup db conn, create table
    beforeAll(async () => {
        await setupTestDatabase()
    })

    // to clear data between tests
    beforeEach(async () => {
        await cleanupTestDatabase()
    })

    // cleanup after all tests
    afterAll(async () => {
        await closeTestDatabase()
    })

    describe('Complete CRUD Flow', () => {

        it('should perform full crud operation on items', async () => {
            // GET - initially empty
            const resGET = await getItems();
            const dataGET = await resGET.json()
            expect(dataGET).toEqual([])
            expect(resGET.status).toBe(200)

            // POST - create first item
            const createReq1 = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'one'})
            });
            const resPOST = await createItem(createReq1)
            const dataPOST = await resPOST.json()
            expect(resPOST.status).toBe(201)
            expect(dataPOST.name).toBe('one')
            expect(dataPOST.id).toBeDefined()
            const firstItemID = dataPOST.id

        })

    })

})