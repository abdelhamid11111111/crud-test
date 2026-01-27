import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET single item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM items WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id } = await params; // Await the params first
    const itemId = parseInt(id, 10); // Then convert to number
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE items SET name = ? WHERE id = ?',
      [name.trim(), itemId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const [updatedItem] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM items WHERE id = ?',
      [itemId]
    );

    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id } = await params; // Await the params first
    const itemId = parseInt(id, 10); // Then convert to number
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM items WHERE id = ?',
      [itemId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
