'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ User_ID: '', Name: '', Email: '', Password: '', Phone: '', Role: 'User' });

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/users');
      const data = await res.json();
      if (!data.error) setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role !== 'Admin') { router.push('/dashboard'); return; }
    fetchUsers();
  }, [router]);

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? WARNING: This will permanently wipe all their vehicles, service history, and replaced parts from the database.")) return;
    
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/users', {
        method: 'DELETE',
        body: JSON.stringify({ User_ID: userId })
      });
      
      if (res.ok) {
        fetchUsers(); // Refresh table instantly
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ User_ID: '', Name: '', Email: '', Password: '', Phone: '', Role: 'User' });
    setIsDialogOpen(true);
  };

  const openEditModal = (user: any) => {
    setIsEditing(true);
    setFormData({ 
      User_ID: user.User_ID, 
      Name: user.Name, 
      Email: user.Email, 
      Password: '', // Leave blank so we don't accidentally overwrite it unless typed
      Phone: user.Phone || '', 
      Role: user.Role 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    // Safety check
    if (!formData.Name.trim() || !formData.Email.trim()) {
      alert('Please fill in Name and Email'); return;
    }
    if (!isEditing && !formData.Password) {
      alert('Password is required for new users.'); return;
    }
    
    const method = isEditing ? 'PUT' : 'POST';
    const res = await fetchWithAuth('http://127.0.0.1:5000/api/users', {
      method: method, 
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setIsDialogOpen(false);
      fetchUsers(); // Refresh table
    } else {
      const data = await res.json();
      alert(`Failed to save user: ${data.error}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Manage Users</h1>
          <p className="text-muted-foreground">Register new user accounts to the database.</p>
        </div>
        <Button onClick={openAddModal} className="bg-accent hover:bg-accent/90 text-primary gap-2">
          <Plus size={18} /> Add User
        </Button>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.User_ID} className="hover:bg-muted/30">
                <td className="px-6 py-4 text-sm font-medium">{user.User_ID}</td>
                <td className="px-6 py-4 text-sm font-medium">{user.Name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.Email}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.Phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.Role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.Role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} className="text-blue-600"><Edit2 size={16} /></Button>
                  {/* WIRED DELETE BUTTON */}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(user.User_ID)} className="text-red-600"><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            
            <input 
              placeholder="User ID (Leave blank to auto-generate)" 
              type="number" 
              value={formData.User_ID} 
              onChange={(e) => setFormData({ ...formData, User_ID: e.target.value })} 
              disabled={isEditing} 
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50" 
            />

            <input required placeholder="Full Name" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
            <input required placeholder="Email" type="email" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
            <input placeholder="Phone" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
            
            <input 
              placeholder={isEditing ? "New Password (leave blank to keep current)" : "Password"} 
              type="password" 
              value={formData.Password} 
              onChange={(e) => setFormData({ ...formData, Password: e.target.value })} 
              required={!isEditing}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" 
            />

            <select value={formData.Role} onChange={(e) => setFormData({ ...formData, Role: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            
            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-primary">{isEditing ? 'Update User' : 'Add User'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}