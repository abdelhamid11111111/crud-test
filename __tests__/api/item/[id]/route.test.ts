import { GET, PUT, DELETE } from '../../../../app/api/item/[id]/route';
import { NextRequest } from 'next/server';
import pool from './../../../../lib/db';

// https://claude.ai/chat/8764dc98-5699-4d46-892f-f856fe4db2de

// exactly here -> API Route Tests for [id] (__tests__/api/item/[id]/route.test.ts)


jest.mock('./../../../../lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  }
}))

describe('API Route: /api/item/[id]', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/item/[id]', () => {

    it("should return a single item by id", async () => {
      
      const mockItem = { id: 1, name: 'Test note', created_at: '2020-01-01'};

      (pool.query as jest.Mock).mockResolvedValue([[mockItem]])

      const req = new NextRequest('http://localhost:3000/api/item/1')
      const res = await GET(req, { params: { id: '1' } })
      const data = await res.json()

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM items WHERE id = ?',
        [1]
      )
      expect(res.status).toBe(200)
      expect(data).toEqual(mockItem)

    })

    it("should return 404 when item not found", async () => {
      
      (pool.query as jest.Mock).mockResolvedValue([[]])

      const req = new NextRequest('http://localhost:3000/api/item/1')
      const res = await GET(req, { params: { id: '4' } })
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe('Item not found')

    })

    it("should return 500 on db error", async () => {
       
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const req = new NextRequest('http://localhost:3000/api/item/999')
      const res = await GET(req, { params: { id: '999' } })
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toBe('Failed to fetch item')

    })

  })

  describe("PUT /api/items/[id]", () => {

    it("should update item successfully", async () => {

      const mockUpdatedItem = { id: 1, name: 'one', created_at: '2020-01-01' };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[mockUpdatedItem]])

      const req = new NextRequest('http://localhost:3000/api/item/1',{
        method: 'PUT',
        body: JSON.stringify({ name: 'updated one'})
      })

      const params = Promise.resolve({ id: '1' }) 

      const res = await PUT(req, { params })
      const data = await res.json()

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        'UPDATE items SET name = ? WHERE id = ?',
        ['updated one', 1]
      )
      expect(res.status).toBe(200)
      expect(data).toEqual(mockUpdatedItem)

    })

    it("should trim whitespace when updating", async () => {

      const mockItemResult = { affectedRows: 1 }
      const mockUpdatedItem = { id: 1, name: 'trimmed', created_at: '2020-02-02'};

      (pool.query as jest.Mock)
      .mockResolvedValue([mockItemResult])
      .mockResolvedValue([[mockUpdatedItem]])

      const req = new NextRequest('http://localhost:3000/api/item/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '  trimmed  ' })
      })

      const res = await PUT(req, { params: Promise.resolve({ id: '1' }) })

      expect(res.status).toBe(200)
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE items SET name = ? WHERE id = ?',
        ['trimmed', 1]
      )

    })

    it("should return 400 for invalid ID format", async () => {

      const req = new NextRequest('http://localhost:3000/api/item/abc', {
        method: 'PUT',
        body: JSON.stringify({ name: 'abs' })
      })

      const res = await PUT(req, { params: Promise.resolve({ id: 'abc'}) })
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe('Invalid ID format')
      expect(pool.query).not.toHaveBeenCalled()

    })

    it('should return 400 when name is empty', async () => {

      const req = new NextRequest('http://localhost:3000/api/item/1', {
        method: 'PUT',
        body: JSON.stringify({ name: ''})
      })

      const res = await PUT(req, { params: Promise.resolve({ id: '1'})})
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe('Name is required')
      expect(pool.query).not.toHaveBeenCalled()

    })

    it('should return 400 when name is only whitespace', async () => {

      const req = new NextRequest('http://localhost:3000/api/item/1', {
        method: 'PUT',
        body: JSON.stringify({ name: '  '})
      })

      const res = await PUT(req, { params: Promise.resolve({ id: '1'})})
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe('Name is required')
      expect(pool.query).not.toHaveBeenCalled()

    })

    it('should return 404 when item does not exist', async () => {

      const mockItemResult = { affectedRows: 0 };

      (pool.query as jest.Mock).mockResolvedValue([mockItemResult])

      const req = new NextRequest('http://localhost:3000/api/item/999', {
        method: 'PUT',
        body: JSON.stringify({ name: 'one' })
      })
      const res = await PUT(req, { params: Promise.resolve({ id: '999' }) })
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe('Item not found')

    })

    it('should return 500 on db error', async () => {
      
      (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const req = new NextRequest('http://localhost:3000/api/item/1',{
        method: 'PUT',
        body: JSON.stringify({ name: 'one'})
      } )
      const res = await PUT(req, { params: Promise.resolve({ id: '1'}) })
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toBe('Failed to update item')

    })

  })  
  
  describe("DELETE /api/item/[id]", () => {
     
    it("should delete an item successfully", async () => {
      const mockDeleteResult = { affectedRows: 1 };

      (pool.query as jest.Mock).mockResolvedValue([mockDeleteResult])

      const req = new NextRequest('http://localhost:3000/api/item/1',{
        method: 'DELETE'
      })
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' })})
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM items WHERE id = ?',
        [1]
      )
      expect(data.message).toBe('Item deleted successfully')

    })

    it('should return 400 for invalid ID format', async () => {

      const req = new NextRequest('http://localhost:3000/api/item/r', {
        method: 'DELETE'
      })
      const res = await DELETE(req, { params: Promise.resolve({ id: 'r' })})
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toBe('Invalid ID format')
      expect(pool.query).not.toHaveBeenCalled()

    })

    it('should return 404 when item does not exist', async () => {
      
      const mockItemResult = { affectedRows: 0 };
      (pool.query as jest.Mock).mockResolvedValue([mockItemResult])

      const req = new NextRequest('http://localhost:3000/api/item/122', {
        method: 'DELETE'
      })
      const res = await DELETE(req, { params: Promise.resolve({ id: '122'})})
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe('Item not found')

    })

    it("should return 500 on db error", async () => {

      (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req = new NextRequest('http://localhost:3000/api/item/1', {
        method: 'DELETE'
      })
      const res = await DELETE(req, { params: Promise.resolve({ id: '1' })})
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toBe('Failed to delete item')

    })

  })

})       

