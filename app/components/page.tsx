"use client";

import React, { useState, useEffect } from "react";
// import { Pencil, Trash2 } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  created_at: string;
}

export default function Component() {

  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null >(null);

  // Initialize on mount only
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/item");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []); // Empty dependency array - runs once on mount

  // Fetch items function for manual calls
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/item");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const addItem = async () => {
    // if (!inputValue.trim()) return;

    try {
      const res = await fetch("/api/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      });

      const data = await res.json()

      if (res.ok) {
        await fetchItems();
        setInputValue("");
        setError(null)
      } else{
        setError(data.error)
      }
    } catch (error) {
      setError(error as string);
      console.error("Error adding item:", error);
    }
  };

  const updateItem = async () => {
    // if (!inputValue.trim() || !editingId) return;

    try {
      const res = await fetch(`/api/item/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      });

      const data = await res.json()
      if (res.ok) {
        await fetchItems();
        setInputValue("");
        setEditingId(null);
        setError(null)
      } else{
        setError(data.error)
      }
      
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (id: number) => {
    
    try {
      const res = await fetch(`/api/item/${id}`, {
        method: "DELETE",
      });

      const data = await res.json()

      if (res.ok) {
        await fetchItems();
        setError(null)
      } else{
        setError(data.error)
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
    
  };

  const handleEdit = (item: Item) => {
    setInputValue(item.name);
    setEditingId(item.id);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateItem();
    } else {
      addItem();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Notes App</h1>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              // onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter a note..."
              className="flex-1 px-4 py-2 border text-black"
            />

            <button
              onClick={handleSubmit}
              // disabled={loading || !inputValue.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                editingId
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {editingId ? "Update" : "Add"}
            </button>
          </div>

          {error && (
              <div className="col-span-2 mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
                {error}
              </div>
            )}

          <div className="space-y-3">
            {
              items.map((item) => (
                <div
                  key={item.id}
                  data-testid="note-text" 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-800 flex-1">{item.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
