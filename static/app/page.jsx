"use client"; 

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; 

export default function VehicleManagementSystem() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' }); 
    const [formData, setFormData] = useState({
        Vehicle_ID: '', User_ID: '', Registration_Number: '',
        Brand: '', Model: '', Purchase_Date: '', Fuel_Type: 'Petrol'
    });

    // Wrapped in useCallback so it can be safely used inside useEffect
    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetchWithAuth('/api/users');
            const data = await response.json();
            if (!data.error) setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    }, []);

    // --- AUTHENTICATION & INITIAL FETCH ---
    useEffect(() => {
        const storedUserData = sessionStorage.getItem('loggedInUser');
        const token = sessionStorage.getItem('authToken');
        
        if (!storedUserData || !token) {
            router.push('/login');
        } else {
            const user = JSON.parse(storedUserData);
            setCurrentUser(user);
            
            // Only trigger fetch if they are an Admin
            if (user.Role === 'Admin') {
                fetchUsers();
            }
        }
    }, [router, fetchUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setMessage({ text: 'Submitting...', type: 'info' });

        try {
            const response = await fetchWithAuth('/api/vehicles', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (response.ok) {
                setMessage({ text: result.message, type: 'success' });
                setFormData({ Vehicle_ID: '', User_ID: '', Registration_Number: '', Brand: '', Model: '', Purchase_Date: '', Fuel_Type: 'Petrol' });
            } else {
                setMessage({ text: `Error: ${result.error}`, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to connect to the server.', type: 'error' });
        }
    };

    if (!currentUser) return null; 

    return (
        <div className="max-w-5xl mx-auto p-6 font-sans fade-in">
            <h1 className="text-4xl font-bold text-center mb-6 text-foreground">
                Vehicle Service Management
            </h1>
            <p className="text-center mb-10 text-lg text-muted-foreground bg-card p-3 rounded-lg border border-border inline-block mx-auto">
                Welcome back, <strong>{currentUser.Name}</strong>! You are logged in as an <strong>{currentUser.Role}</strong>.
            </p>

            <div className="flex flex-wrap gap-8">
                {currentUser.Role === 'Admin' ? (
                    <>
                        <div className="flex-1 min-w-[320px] bg-card text-card-foreground p-6 rounded-xl border border-border shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4">Add New Vehicle</h2>
                            {message.text && (
                                <p className={`mb-4 font-bold ${message.type === 'error' ? 'text-destructive' : 'text-accent'}`}>
                                    {message.text}
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <label className="font-medium text-sm">Vehicle ID:
                                    <input type="number" name="Vehicle_ID" value={formData.Vehicle_ID} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Owner (User ID):
                                    <input type="number" name="User_ID" value={formData.User_ID} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Registration Number:
                                    <input type="text" name="Registration_Number" value={formData.Registration_Number} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Brand:
                                    <input type="text" name="Brand" value={formData.Brand} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Model:
                                    <input type="text" name="Model" value={formData.Model} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Purchase Date:
                                    <input type="date" name="Purchase_Date" value={formData.Purchase_Date} onChange={handleChange} required className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none" />
                                </label>
                                <label className="font-medium text-sm">Fuel Type:
                                    <select name="Fuel_Type" value={formData.Fuel_Type} onChange={handleChange} className="w-full mt-1 p-2.5 bg-input border border-border rounded-md outline-none">
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="EV">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </label>
                                <button type="submit" className="mt-2 p-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90">Add Vehicle</button>
                            </form>
                        </div>
                        <div className="flex-1 min-w-[320px] bg-card text-card-foreground p-6 rounded-xl border border-border shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
                            <button onClick={fetchUsers} className="mb-6 px-4 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:opacity-90">Refresh List</button>
                            {users.length === 0 ? <p className="text-muted-foreground italic">No users found.</p> : (
                                <ul className="space-y-3">
                                    {users.map((user) => (
                                        <li key={user.User_ID} className="bg-background border border-border p-4 rounded-lg shadow-sm">
                                            <strong className="text-accent">ID: {user.User_ID}</strong> - {user.Name} 
                                            <span className="text-muted-foreground ml-2">({user.Role})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full bg-card text-card-foreground p-8 rounded-xl border border-border shadow-lg text-center">
                        <h2 className="text-3xl font-semibold mb-4">My Dashboard</h2>
                        <p className="text-muted-foreground text-lg">Regular users dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}