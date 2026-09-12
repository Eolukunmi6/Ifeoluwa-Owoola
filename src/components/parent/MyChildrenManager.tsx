import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Child } from '../../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

export function MyChildrenManager() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', profile?.id)
        .order('created_at', { ascending: false });

      if (fetchError && fetchError.code !== 'PGRST205') throw fetchError;
      setChildren(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchChildren();
    }
  }, [profile?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || isNaN(Number(age)) || Number(age) <= 0) {
      setError('Please provide a valid name and age.');
      return;
    }

    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('children')
        .insert({
          parent_id: profile?.id,
          name: name.trim(),
          age: Number(age)
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setChildren([data, ...children]);
      setShowAddForm(false);
      setName('');
      setAge('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !editAge || isNaN(Number(editAge)) || Number(editAge) <= 0) {
      setError('Please provide a valid name and age.');
      return;
    }

    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('children')
        .update({
          name: editName.trim(),
          age: Number(editAge)
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setChildren(children.map(c => c.id === id ? data : c));
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (deleteError) {
        alert("Database Error: " + deleteError.message);
        throw deleteError;
      }
      
      setChildren(children.filter(c => c.id !== id));
      alert("Child removed successfully.");
    } catch (err: any) {
      setError(err.message);
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading children...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Children</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Child
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add a Child</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Child's name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="25"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Age"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Child
            </button>
          </div>
        </form>
      )}

      {children.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No children added yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Add your first child to start booking tutors and managing lessons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map(child => (
            <div key={child.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              {editingId === child.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Age"
                    min="1"
                  />
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleUpdate(child.id)} className="p-2 text-indigo-600 hover:text-indigo-700">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{child.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{child.age} years old</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingId(child.id);
                        setEditName(child.name);
                        setEditAge(child.age.toString());
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deletingId === child.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(child.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Yes, delete</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(child.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
