"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getToken } from "@/utils/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
};

export default function CustomersManagement() {
  const t = useTranslations("Admin");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-1">{t("customers")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage registered users</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/50 bg-surface">
          <h3 className="font-title-md text-title-md text-on-background">Users List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Address</th>
                <th className="p-4 font-semibold text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/30">
              {isLoading ? (
                <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-on-surface-variant">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{user.address}</td>
                    <td className="p-4 text-right rtl:text-left">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-error hover:text-error-container p-2 rounded-full hover:bg-error-container/10 transition-colors"
                        title="Delete User"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
