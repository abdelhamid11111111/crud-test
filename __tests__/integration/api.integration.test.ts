import { NextRequest } from 'next/server';
import { GET as getItems, POST as createItem } from '../../app/api/item/route'
import { GET as getItem, PUT as updateItem, DELETE as deleteItem } from '../../app/api/item/[id]/route'
import { setupTestDatabase, cleanupTestDatabase, closeTestDatabase } from "../../lib/testDb";
import { waitFor } from '@testing-library/react';



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
            const resGET = await getItems()
            const dataGET = await resGET.json()
            expect(dataGET).toEqual([])
            expect(resGET.status).toBe(200)

            // POST - create first item
            const req1 = new NextRequest('http://localhost:3000/api/item',{
                method: 'POST',
                body: JSON.stringify({ name: 'one' })
            })
            const resPOST = await createItem(req1)
            const dataPOST = await resPOST.json()
            expect(resPOST.status).toBe(201)
            expect(dataPOST.name).toEqual('one')
            expect(dataPOST.id).toBeDefined()
            const firstItemID = dataPOST.id

            // POST - create first item
            const req2 = new NextRequest('http://localhost:3000/api/item',{
                method: 'POST',
                body: JSON.stringify({ name: 'two' })
            })
            const resPOST2 = await createItem(req2)
            const dataPOST2 = await resPOST2.json()
            expect(resPOST.status).toBe(201)
            expect(dataPOST2.name).toEqual('two')
            expect(dataPOST2.id).toBeDefined()
            const secondItemId = dataPOST2.id

            // GET - fetch all item should be 2
            const resGET2 = await getItems()
            const dataGET2 = await resGET2.json()
            expect(dataGET2).toHaveLength(2)
            expect(dataGET2[0].name).toBe('one')
            expect(dataGET2[1].name).toBe('two')
            expect(resGET2.status).toBe(200)

            // GET - fetch single item
            const reqGET = new NextRequest(`http://localhost:3000/api/item/${firstItemID}`)
            const resGET3 = await getItem(reqGET, { params: Promise.resolve({ id: String(firstItemID) }) })
            const dataGET3 = await resGET3.json()
            expect(dataGET3.name).toBe('one')
            expect(dataGET3.id).toBe(firstItemID)
            expect(resGET3.status).toBe(200)

            // PUT - Update first item
            const reqPUT = new NextRequest(`http://localhost:3000/api/item/${firstItemID}`, {
                method: 'PUT',
                body: JSON.stringify({ name: 'one updated'})
            })
            const resPUT = await updateItem(reqPUT, { params: Promise.resolve({ id: String(firstItemID) }) })
            const dataPUT = await resPUT.json()
            expect(dataPUT.name).toBe('one updated')
            expect(resPUT.status).toBe(200)
            expect(dataPUT.id).toBe(firstItemID)

            // GET - verify update
            const reqGET2 = new NextRequest(`http://localhost:3000/api/item/${firstItemID}`)
            const resGET4 = await getItem(reqGET2, { params: Promise.resolve({ id: String(firstItemID) }) })
            const dataGET4 = await resGET4.json()
            expect(dataGET4.name).toBe('one updated')
            expect(dataGET4.id).toBe(firstItemID)
            expect(resGET4.status).toBe(200)

            // DELETE - remove first item
            const reqDELETE = new NextRequest(`http://localhost:3000/api/item/${firstItemID}`, {
                method: 'DELETE'
            })
            const resDELETE = await deleteItem(reqDELETE, { params: Promise.resolve({ id: String(firstItemID) })})
            const dataDELETE = await resDELETE.json()
            expect(resDELETE.status).toBe(200)
            expect(dataDELETE.message).toBe('Item deleted successfully')

            // GET - verify deletion
            const resGET5 = await getItems()
            const dataGET5 = await resGET5.json()
            expect(dataGET5).toHaveLength(1)
            expect(dataGET5[0].name).toBe('two')
            expect(resGET5.status).toBe(200)

            // DELETE - remove first item
            const reqDELETE2 =  new NextRequest(`http://localhost:3000/api/item/${secondItemId}`, {
                method: 'DELETE'
            })
            const resDELETE2 = await deleteItem(reqDELETE2, { params: Promise.resolve({ id: String(secondItemId) } )})
            const dataDELETE2 = await resDELETE2.json()
            expect(resDELETE2.status).toBe(200)
            expect(dataDELETE2.message).toBe('Item deleted successfully')

            // GET - verify all deleted
            const resGET6 = await getItems()
            const dataGET6 = await resGET6.json()
            expect(resGET6.status).toBe(200)
            expect(dataGET6).toEqual([])

        })

    })

    describe('Data Validation Integration', () => {

        it('should enforce validation rules across operation', async () => {
            // try to create with empty name
            const reqPOST = new NextRequest('https://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: '' })
            })
            const resPOST = await createItem(reqPOST)
            const dataPOST = await resPOST.json()
            expect(dataPOST.error).toBe('Note is required')
            expect(resPOST.status).toBe(400)

            // try to create whitespace only 
            const reqPOST2 = new NextRequest('https://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: '  ' })
            })
            const resPOST2 = await createItem(reqPOST2)
            const dataPOST2 = await resPOST2.json()
            expect(dataPOST2.error).toBe('Note is required')
            expect(resPOST2.status).toBe(400)

            // create valid item
            const reqPOST3 = new NextRequest('https://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: ' one' })
            })
            const resPOST3 = await createItem(reqPOST3)
            const dataPOST3 = await resPOST3.json()
            expect(resPOST3.status).toBe(201)
            expect(dataPOST3.name).toBe('one')
            expect(dataPOST3.id).toBeDefined()
            const itemId = dataPOST3.id

            // try to update with empty name
            const reqPUT = new NextRequest(`https://localhost:3000/api/item/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: '  ' })
            })
            const resPUT = await updateItem(reqPUT, { params: Promise.resolve({ id: String(itemId) })})
            const dataPUT = await resPUT.json()
            expect(resPUT.status).toBe(400)
            expect(dataPUT.error).toBe('Name is required') 

            // verify item was not changed
            const res = await getItems()
            const data = await res.json()
            expect(data[0].name).toBe('one')

        })

    })

    describe('Error handling integration', () => {

        it('should handle non-existent items correctly', async () => {
            const nonExistentId = 99;

            // try to get non-existent item
            const reqGET = new NextRequest(`http://localhost:3000/api/item/${nonExistentId}`)
            const resGET = await getItem(reqGET, { params: Promise.resolve({ id: String(nonExistentId) }) })
            const dataGET = await resGET.json()
            expect(dataGET.error).toBe('Item not found')
            expect(resGET.status).toBe(404)

            // try to update non-existent item
            const reqPUT = new NextRequest(`http://localhost:3000/api/item/${nonExistentId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: 'two'})
            })
            const resPUT = await updateItem(reqPUT, { params: Promise.resolve({ id: String(nonExistentId) })})
            const dataPUT = await resPUT.json()
            expect(resPUT.status).toBe(404)
            expect(dataPUT.error).toBe('Item not found')

            // try to update non-existent item
            const reqDELETE = new NextRequest(`http://localhost:3000/api/item/${nonExistentId}`, {
                method: 'DELETE'
            })
            const resDELETE = await deleteItem(reqDELETE, { params: Promise.resolve({ id: String(nonExistentId) })})
            const dataDELETE = await resDELETE.json()
            expect(resDELETE.status).toBe(404)
            expect(dataDELETE.error).toBe('Item not found')

        })
 
        it('should handle invalid ID formats', async () => {
            const invalidIDs = ['abc', '12.5', 'null', 'undefined'] 

            for (const invalidId of invalidIDs){
                // try to update with invalid id
                const reqPUT = new NextRequest(`http://localhost:3000/api/item/${invalidId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name: 'updated' })
                })
                const resPUT = await updateItem(reqPUT, { params: Promise.resolve({ id: invalidId })})
                const dataPUT = await resPUT.json()
                expect(resPUT.status).toBe(400)
                expect(dataPUT.error).toBe('Invalid ID format')

                // try to delete with invalid id
                const reqDELETE = new NextRequest(`http://localhost:3000/api/item/${invalidId}`, {
                    method: 'DELETE'
                })
                const resDELETE = await deleteItem(reqDELETE, { params: Promise.resolve({ id: invalidId })})
                const dataDELETE = await resDELETE.json()
                expect(resDELETE.status).toBe(400)
                expect(dataDELETE.error).toBe('Invalid ID format')

            }
        })
    })

    describe('Data Ordering Integration', () => {

        it('should maintain correct ordering by created_at DESC', async () => {
            
            // Clean up database before test to ensure predictable data
            await cleanupTestDatabase()
            
            // create items with 1+ second delays to ensure different TIMESTAMP values
            // (MySQL TIMESTAMP has second precision, not millisecond)
            const req1 = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'one' })
            })

            await createItem(req1)
            await new Promise(resolve => setTimeout(resolve, 1100))

            const req2 = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'two' })
            })

            await createItem(req2)
            await new Promise(resolve => setTimeout(resolve, 1100))

            const req3 = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'three' })
            })

            await createItem(req3)

            const res = await getItems()
            const data = await res.json()

            expect(data).toHaveLength(3)
            expect(data[0].name).toBe('three')
            expect(data[1].name).toBe('two')
            expect(data[2].name).toBe('one')

        })

    })

    describe('concurrent operations integration', () => {

        it('should handle multiple simultaneous creates', async () => {
            const items = ['item a', 'item b', 'item c', 'item d', 'item e']

            for (const itemName of items) {
                const req = new NextRequest('http://localhost:3000/api/item', {
                    method: 'POST',
                    body: JSON.stringify({ name: itemName })
                })
                const res = await createItem(req)
                expect(res.status).toBe(201)
            }
            const getRes = await getItems()
            const dataRes = await getRes.json()
            expect(dataRes).toHaveLength(5)
            
        })

        it('should handle update after delete scenario', async () => {

            // create item
            const reqPOST = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'one' })
            })
            const resPOST = await createItem(reqPOST)
            const dataPOST = await resPOST.json()
            expect(dataPOST.name).toBe('one')
            const itemId = dataPOST.id

            // delete item
            const reqDELETE = new NextRequest(`http://localhost:3000/api/item/${itemId}`, {
                method: 'DELETE',
            })
            const resDELETE = await deleteItem(reqDELETE, { params: Promise.resolve({ id: itemId})})
            const dataDELETE = await resDELETE.json()
            expect(dataDELETE.message).toBe('Item deleted successfully')

            // check get
            const res = await getItems()
            const data = await res.json()
            expect(data).toHaveLength(0)

            // update deleted item
            const reqPUT = new NextRequest(`http://localhost:3000/api/item/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: 'two' })
            })
            const resPUT = await updateItem(reqPUT, { params: Promise.resolve({ id: itemId})})
            const dataPUT = await resPUT.json()
            expect(resPUT.status).toBe(404)
            expect(dataPUT.error).toBe('Item not found')

        })

    })

})