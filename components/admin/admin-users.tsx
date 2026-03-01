"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, ShieldOff, User, Users, Crown } from "lucide-react"

interface UserType {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
  upi_id: string | null
  created_at: string
  phone: string | null
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'admins' | 'users'>('all')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: number, isAdmin: boolean) => {
    // Prevent removing last admin
    if (isAdmin) {
      const adminCount = users.filter(u => u.is_admin).length
      if (adminCount <= 1) {
        alert('⚠️ Cannot remove the last admin! Make another user admin first.')
        return
      }
    }

    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !isAdmin })
      })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setUpdating(null)
    }
  }

  const adminCount = users.filter(u => u.is_admin).length
  const userCount = users.filter(u => !u.is_admin).length

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'admins' && u.is_admin) || 
      (filter === 'users' && !u.is_admin)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'admins', 'users'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-blue-600' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Last admin warning */}
      {adminCount === 1 && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          <Crown className="w-4 h-4 flex-shrink-0" />
          <span>You are the only admin. Make another user admin before removing yourself.</span>
        </div>
      )}

      {/* Users Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">UPI ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 ${user.is_admin ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${user.is_admin ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {user.is_admin
                              ? <Crown className="w-4 h-4 text-red-600" />
                              : <User className="w-4 h-4 text-blue-600" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.display_name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.upi_id || '—'}</td>
                      <td className="px-4 py-3">
                        {user.is_admin
                          ? <Badge className="bg-red-100 text-red-700">Admin</Badge>
                          : <Badge className="bg-gray-100 text-gray-600">User</Badge>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === user.id || (user.is_admin && adminCount <= 1)}
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={user.is_admin
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : "text-blue-600 border-blue-200 hover:bg-blue-50"
                          }
                          title={user.is_admin && adminCount <= 1 ? 'Cannot remove last admin' : ''}
                        >
                          {updating === user.id ? (
                            'Updating...'
                          ) : user.is_admin ? (
                            <><ShieldOff className="w-3 h-3 mr-1" /> Remove Admin</>
                          ) : (
                            <><Shield className="w-3 h-3 mr-1" /> Make Admin</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}