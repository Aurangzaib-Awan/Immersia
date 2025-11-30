// pages/admin/RoleManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Shield, Users, GraduationCap, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';

const RoleManagement = () => {
  const [roleEmails, setRoleEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  const [newRoleEmail, setNewRoleEmail] = useState({
    email: '',
    role: 'hr',
    is_verified: true
  });

  useEffect(() => {
    fetchRoleEmails();
  }, [filterRole]);

  const fetchRoleEmails = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8000/admin/role-emails';
      if (filterRole) {
        url += `?role=${filterRole}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setRoleEmails(data.role_emails || []);
    } catch (error) {
      console.error('Error fetching role emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoleEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/admin/role-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRoleEmail)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewRoleEmail({ email: '', role: 'hr', is_verified: true });
        fetchRoleEmails();
        alert('Role email added successfully');
      } else {
        alert('Error adding role email');
      }
    } catch (error) {
      console.error('Error adding role email:', error);
      alert('Error adding role email');
    }
  };

  const handleUpdateRoleEmail = async (email, updates) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/role-emails/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchRoleEmails();
        alert('Role email updated successfully');
      } else {
        alert('Error updating role email');
      }
    } catch (error) {
      console.error('Error updating role email:', error);
      alert('Error updating role email');
    }
  };

  const handleDeleteRoleEmail = async (email) => {
    if (!window.confirm('Are you sure you want to delete this role email?')) return;

    try {
      const response = await fetch(`http://localhost:8000/admin/role-emails/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchRoleEmails();
        alert('Role email deleted successfully');
      } else {
        alert('Error deleting role email');
      }
    } catch (error) {
      console.error('Error deleting role email:', error);
      alert('Error deleting role email');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'hr': return <Users className="w-4 h-4" />;
      case 'mentor': return <GraduationCap className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20 border-red-400/20';
      case 'hr': return 'text-blue-400 bg-blue-500/20 border-blue-400/20';
      case 'mentor': return 'text-green-400 bg-green-500/20 border-green-400/20';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/20';
    }
  };

  const filteredRoleEmails = roleEmails.filter(roleEmail =>
    roleEmail.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roleEmail.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading role emails...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
            Role Email Management
          </h1>
          <p className="text-gray-400">Manage admin, HR, and mentor email access</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full sm:w-80">
              <div className="bg-surface-800 rounded-xl p-2">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search emails or roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-4 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-surface-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
          >
            <div className="bg-surface-800 rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-gray-700 transition-colors duration-300">
              <Plus className="w-5 h-5" />
              Add Role Email
            </div>
          </button>
        </div>

        {/* Add Role Form */}
        {showAddForm && (
          <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow mb-6">
            <div className="bg-surface-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Add New Role Email</h3>
              <form onSubmit={handleAddRoleEmail} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Email</label>
                  <input
                    type="email"
                    required
                    value={newRoleEmail.email}
                    onChange={(e) => setNewRoleEmail({...newRoleEmail, email: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="user@company.com"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Role</label>
                  <select
                    required
                    value={newRoleEmail.role}
                    onChange={(e) => setNewRoleEmail({...newRoleEmail, role: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={newRoleEmail.is_verified}
                    onChange={(e) => setNewRoleEmail({...newRoleEmail, is_verified: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_verified" className="text-gray-300 text-sm">
                    Verified (can login with this role immediately)
                  </label>
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Add Role Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Emails Table */}
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
          <div className="bg-surface-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Role</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Created</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoleEmails.map((roleEmail) => (
                    <tr key={roleEmail._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-300">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-sky-400" />
                          <span className="text-white">{roleEmail.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getRoleColor(roleEmail.role)}`}>
                          {getRoleIcon(roleEmail.role)}
                          {roleEmail.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          roleEmail.is_verified 
                            ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20'
                        }`}>
                          {roleEmail.is_verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {roleEmail.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300 text-sm">
                        {new Date(roleEmail.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {!roleEmail.is_verified ? (
                            <button
                              onClick={() => handleUpdateRoleEmail(roleEmail.email, { is_verified: true })}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-300 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateRoleEmail(roleEmail.email, { is_verified: false })}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-300 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Unverify
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRoleEmail(roleEmail.email)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredRoleEmails.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No role emails found</h3>
                <p className="text-gray-400">Add your first role email to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;