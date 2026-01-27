import { fireEvent, getByTitle, render, screen, waitFor } from '@testing-library/react'
import Home from '../../app/page'
import userEvent from '@testing-library/user-event'
import { json } from 'stream/consumers'

describe('Home Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  describe('Initial Render and Data Fetching', () => {

    it('should fetch and display items on mount', async () => {

      const mockItems = [
        { id: 1, name: 'Note 1', created_At: '2020-02-01' },
        { id: 2, name: 'Note 2', created_At: '2020-02-02' } 
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })

      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Note 1')).toBeInTheDocument()
        expect(screen.getByText('Note 2')).toBeInTheDocument()
      })
    
    })

    it('should handle fetch error gracefully on mount', async () => {

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<Home />)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled()
      })
      consoleError.mockRestore()

    })

    it('should display empty state when no items exist', async () => {

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      render(<Home />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item')
      })

      const noteTexts = screen.queryAllByTestId('note-text')
      expect(noteTexts).toHaveLength(0)

    });

  })

  describe('Adding Items', () => {

    it('should add a new item successfully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
      // INITIAL LOAD WITH EMPTY STATE ; ok: true -> positive status, ok: false -> negative status
      .mockResolvedValueOnce({ok: true, json: async () => []})
      // ADD NOTE
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 1, name: 'note', created_at: '2020-03-02'})
      })
      // LOAD STATE WITH ADDED NOTE
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'note', created_at: '2020-03-02'}]
      })

      render(<Home />)

      const input = screen.getByPlaceholderText('Enter a note...')
      const addBtn = screen.getByText('Add')

      await user.type(input, 'note')
      await user.click(addBtn)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item', {
          method: 'POST',
          headers: { 'Content-Type' : 'application/json' },
          body: JSON.stringify({ name: 'note' })
        })
      })

      expect(screen.getByText('note')).toBeInTheDocument()
      expect(input).toHaveValue('')

    })

    it('should display error when adding item fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => []})
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Note is required' })
      })

      render(<Home />)

      const btnAdd = screen.getByText('Add')

      await user.click(btnAdd)

      await waitFor(() => {
        expect(screen.getByText('Note is required')).toBeInTheDocument()
      })

    })

    it('should allow adding item with empty input (validation on backend)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Note is required' })
      })

      render(<Home />)

      const input = screen.getByPlaceholderText('Enter a note...')
      const addBtn = screen.getByText('Add')

      await user.type(input, '  ')
      await user.click(addBtn)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item', {
          method: 'POST',
          headers: { 'Content-Type' : 'application/json' },
          body: JSON.stringify({ name: '  '})
        })
      })

    })

  })

  describe('Edit Items', () => {

    it('should populate input and switch to edit mode when edit is clicked', async () => {
      const user = userEvent.setup();

      const mockItems = [{ id: 1, name: 'one', created_at: '2020-03-01' }];

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockItems })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument()
      })

      const editBtn = screen.getByTitle('Edit')
      await user.click(editBtn)

      const updateBtn = screen.getByText('Update')
      const addBtn = screen.queryByText('Add')
      const input = screen.getByPlaceholderText('Enter a note...')


      expect(input).toHaveValue('one')
      expect(updateBtn).toBeInTheDocument()
      expect(addBtn).not.toBeInTheDocument()

    })

    it('should update an item successfully', async () => {
      const user = userEvent.setup()

      const mockItem = [{ id: 1, name: 'one', created_at: '2020-02-01'}];

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => mockItem
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'two', created_at: '2020-03-10'})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'two', created_at: '2020-03-10'}]
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument()
      })

      const editBtn = screen.getByTitle('Edit')
      await user.click(editBtn)

      const input = screen.getByPlaceholderText('Enter a note...')
      expect(input).toHaveValue('one')

      await user.clear(input)
      await user.type(input, 'two')
      expect(input).toHaveValue('two')

      const updateBtn = screen.getByText('Update')
      await user.click(updateBtn)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item/1', {
          method: 'PUT',
          headers: { 'Content-Type' : 'application/json' },
          body: JSON.stringify({ name: 'two' })
        })
      })
      await waitFor(() => {
        expect(screen.getByText('two')).toBeInTheDocument()
      })
      expect(input).toHaveValue('')
      const addBtn = screen.getByText('Add')
      expect(addBtn).toBeInTheDocument()

    })

    it('should display error when update fails', async () => {
      const user = userEvent.setup()

      const mockItem = [{ id: 1, name: 'one', created_at: '2020-03-01'}];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Item not found' })
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument()
      })
      const editBtn = screen.getByTitle('Edit')
      await user.click(editBtn)

      const updateBtn = screen.getByText('Update')
      await user.click(updateBtn)

      await waitFor(() => {
        expect(screen.getByText('Item not found')).toBeInTheDocument()
      })

    })
    
  })

  describe('Deleting Items', () => {

    it('should delete an item successfully', async () => {
      const user = userEvent.setup()

      const mockItem = [{ id: 1, name: 'one', created_at: '2020-03-01' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Item deleted successfully' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument()
      })

      const deleteBtn = screen.getByTitle('Delete')
      await user.click(deleteBtn)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item/1', {
          method: 'DELETE'
        })
      })

      await waitFor(() => {
        const listItems = screen.queryAllByTestId('note-text')
        expect(listItems).toHaveLength(0)
      })

    })

    it('should display error when delete fails', async () => {
      const user = userEvent.setup()
      const mockItem = [{ id: 1, name: 'one', created_at: '2020-03-01'}];

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem 
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Item not found' })
      })
      render(<Home/>)

      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument()
      })

      const deleteBtn = screen.getByTitle('Delete')
      await user.click(deleteBtn)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/item/1', {
          method: 'DELETE'
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Item not found')).toBeInTheDocument()
      })

    })

  })

  describe('Error handling', () => {

    it('should clear error when successful operation occurs after error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Note is required' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'one', created_at: '2020-03-01' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'one', created_at: '2020-03-01' }]
      })

      render(<Home />)

      const input = screen.getByPlaceholderText('Enter a note...')
      await user.type(input, '  ')
      const addBtn = screen.getByText('Add')
      await user.click(addBtn)
      await waitFor(() => {
        expect(screen.queryByText('Note is required')).toBeInTheDocument()
      })


      await user.type(input, 'one')
      await user.click(addBtn)

      expect(screen.getByText('one')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.queryByText('Note is required')).not.toBeInTheDocument()
      })

    })

  })

})