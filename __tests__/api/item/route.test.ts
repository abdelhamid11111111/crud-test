import { GET, POST } from '../../../app/api/item/route'
import { NextRequest } from 'next/server'
import pool from '../../../lib/db'


jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));


describe("API Route: /api/item", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe("GET /api/item", () => {

        it('should return all items ordered by created_at DESC', async () => {

            const mockItems = [
                { id: 2, name: 'Rencent Note', created_at: '2024-01-02'},
                { id: 1, name: 'Old Note', created_at: '2024-01-01'}
            ];
            
            (pool.query as jest.Mock).mockResolvedValue([mockItems])

            const res = await GET()
            const data = await res.json()

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM items ORDER BY created_at DESC'
            )
            expect(res.status).toBe(200)
            expect(data).toEqual(mockItems)

        })

        it("should return empty array when no data exist", async () => {

            (pool.query as jest.Mock).mockResolvedValue([[]])

            const res = await GET()
            const data = await res.json()

            expect(res.status).toBe(200)
            expect(data).toEqual([])

        })

        it("should return 500 on db error", async () => {

            (pool.query as jest.Mock).mockRejectedValue(new Error('DB Connection Failed'))

            const res = await GET()
            const data = await res.json()

            expect(res.status).toBe(500)
            expect(data.error).toBe('Failed to fetch items')

        })

    })

    describe("POST /api/item", () => {

       it('should create a new item with valid data', async () => {
      
            // mockInsertResult is the res of db when mockNewItem created
            const mockInsertResult = { insertId: 1 };
            const mockNewItem = { id: 1, name: 'New Note', created_at: '2024-01-01' };

            // 2 calls, 1: for db res ( select ...); 2: for user req ( insert ...)
            (pool.query as jest.Mock)
                .mockResolvedValueOnce([mockInsertResult])
                .mockResolvedValueOnce([[mockNewItem]])

            // create http req
            const req = new NextRequest('http://localhost:3000/api/item', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Note' })
            })

            const res = await POST(req)
            const data = await res.json()

            expect(pool.query).toHaveBeenCalledTimes(2)
            expect(pool.query).toHaveBeenNthCalledWith(
                1, 'INSERT INTO items (name) VALUES (?)', ['New Note']
            )
            expect(pool.query).toHaveBeenNthCalledWith(
                2 , 'SELECT * FROM items WHERE id = ?', [1]
            )
            expect(res.status).toBe(201)
            expect(data).toEqual(mockNewItem)
      
       });

       it("should trim whitespace from note name", async () => {
        
        const mockInsertResult = { insertId: 1 };
        const mockNewItem = { id: 1, name: "one", created_at: '2020-03-04' };

        (pool.query as jest.Mock)
            .mockResolvedValueOnce([mockInsertResult])
            .mockResolvedValueOnce([[mockNewItem]])

        const req = new NextRequest('http://localhost:3000/api/item', {
            method: 'POST',
            body: JSON.stringify({ name: '   one   '})
        })

        await POST(req)

        expect(pool.query).toHaveBeenNthCalledWith(
            1, 'INSERT INTO items (name) VALUES (?)', ['one']
        )

       })

       it("should return 400 when name is empty string", async () => {
        
        const req = new NextRequest('http://localhost:3000/api/item', {
            method: 'POST',
            body: JSON.stringify({ name: '' })
        })

        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toBe('Note is required')
        expect(pool.query).not.toHaveBeenCalled()

       })

       it("should return 400 when name is only whitespace", async () => {

        const req = new NextRequest('http://localhost:3000/api/item', {
            method: 'POST',
            body: JSON.stringify({ name: '  ' })
        })

        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toBe('Note is required')
        expect(pool.query).not.toHaveBeenCalled()

       })

       it("should return 400 when name is missing", async () => {

        const req = new NextRequest('http://localhost:3000/api/item', {
            method: 'POST',
            body: JSON.stringify({})
        })

        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toBe('Note is required')
        expect(pool.query).not.toHaveBeenCalled()

       })

       it("should return 500 on db error", async () => {

        (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'))

        const req = new NextRequest('http://localhost:3000/api/item', {
            method: 'POST',
            body: JSON.stringify({ name: 'one' })
        })

        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(500)
        expect(data.error).toBe('Failed to create item')

       })

    })
})