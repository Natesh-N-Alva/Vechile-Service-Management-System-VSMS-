'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { UserPlus } from 'lucide-react';

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Role: 'User',
    Password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        onSuccess(); // Tell the parent component to close the modal and refresh data
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
        <input 
          type="text" 
          value={formData.Name} 
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })} 
          className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
          <input 
            type="email" 
            value={formData.Email} 
            onChange={(e) => setFormData({ ...formData, Email: e.target.value })} 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Phone</label>
          <input 
            type="text" 
            value={formData.Phone} 
            onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Temporary Password</label>
          <input 
            type="password" 
            value={formData.Password} 
            onChange={(e) => setFormData({ ...formData, Password: e.target.value })} 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">System Role</label>
          <select 
            value={formData.Role} 
            onChange={(e) => setFormData({ ...formData, Role: e.target.value })} 
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="User">Regular User</option>
            <option value="Admin">Administrator</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-2 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-accent text-primary gap-2" disabled={isLoading}>
          <UserPlus size={16} />
          {isLoading ? 'Saving...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}