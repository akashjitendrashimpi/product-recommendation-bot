"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, ShieldOff, User, Users, Crown, Ban, CheckCircle, X, AlertTriangle } from "lucide-react"

interface UserType {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
  is_banned: boolean
  ban_reason: string | null
  upi_id: string | null
  created_at: string
  phone: string | null
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'admins' | 'users' | 'banned'>('all')
  const [banModal, setBanModal] = useState<UserType | null>(null)
  const [banReason, setBanReason] = useState("")

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setUsers((await res.json()).users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: number, isAdmin: boolean) => {
    if (isAdmin) {
      const adminCount = users.filter(u => u.is_admin).length
      if (adminCount <= 1) {
        alert('⚠️ Cannot remove the last admin!')
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
    } finally {
      setUpdating(null)
    }
  }

  const handleBan = async (user: UserType) => {
    if (user.is_banned) {
      // Unban directly
      setUpdating(user.id)
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_banned: false, ban_reason: null })
        })
        if (res.ok) fetchUsers()
      } finally {
        setUpdating(null)
      }
    } else {
      // Show ban modal
      setBanModal(user)
      setBanReason("")
    }
  }

  const confirmBan = async () => {
    if (!banModal) return
    setUpdating(banModal.id)
    try {
      const res = await fetch(`/api/admin/users/${banModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_banned: true, ban_reason: banReason.trim() || "Violation of terms" })
      })
      if (res.ok) { fetchUsers(); setBanModal(null) }
    } finally {
      setUpdating(null)
    }
  }

  const adminCount = users.filter(u => u.is_admin).length
  const bannedCount = users.filter(u => u.is_banned).length

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'admins' && u.is_admin) ||
      (filter === 'users' && !u.is_admin && !u.is_banned) ||
      (filter === 'banned' && u.is_banned)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ban className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Ban User?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">{banModal.display_name || banModal.email}</p>
            <p className="text-xs text-gray-400 text-center mb-5">{banModal.email}</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-700 text-xs">This user will be immediately blocked from logging in.</p>
            </div>
            <div className="space-y-2 mb-5">
              <label className="text-sm font-semibold text-gray-700">Ban Reason</label>
              <Input
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="e.g. Fake screenshots, spam, abuse..."
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400">Optional — shown in records</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setBanModal(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={confirmBan}
                disabled={updating === banModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
              >
                {updating === banModal.id ? 'Banning...' : 'Yes, Ban User'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'blue' },
          { label: 'Admins', value: adminCount, icon: Crown, color: 'red' },
          { label: 'Regular', value: users.length - adminCount - bannedCount, icon: User, color: 'green' },
          { label: 'Banned', value: bannedCount, icon: Ban, color: 'orange' },
        ].map((s, i) => (
          <Card key={i} className={`border border-${s.color}-200 bg-${s.color}-50 rounded-2xl`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600`} />
              </div>
              <div>
                <p className={`text-xs text-${s.color}-600 font-medium`}>{s.label}</p>
                <p className={`text-2xl font-black text-${s.color}-700`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(['all', 'users', 'admins', 'banned'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'banned' && bannedCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{bannedCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Last admin warning */}
      {adminCount === 1 && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          You are the only admin. Make another user admin before removing yourself.
        </div>
      )}

      {/* Users Table */}
      <Card className="border border-gray-200 rounded-2xl">
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
                    <tr key={user.id} className={`hover:bg-gray-50 ${user.is_admin ? 'bg-red-50/30' : ''} ${user.is_banned ? 'bg-gray-50 opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            user.is_banned ? 'bg-gray-200' : user.is_admin ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {user.is_banned
                              ? <Ban className="w-4 h-4 text-gray-500" />
                              : user.is_admin
                              ? <Crown className="w-4 h-4 text-red-600" />
                              : <User className="w-4 h-4 text-blue-600" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.display_name || 'No name'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.is_banned && user.ban_reason && (
                              <p className="text-xs text-red-500 mt-0.5">🚫 {user.ban_reason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.upi_id || '—'}</td>
                      <td className="px-4 py-3">
                        {user.is_banned
                          ? <Badge className="bg-gray-100 text-gray-500 border-0">Banned</Badge>
                          : user.is_admin
                          ? <Badge className="bg-red-100 text-red-700 border-0">Admin</Badge>
                          : <Badge className="bg-gray-100 text-gray-600 border-0">User</Badge>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Admin toggle — only for non-banned users */}
                          {!user.is_banned && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === user.id || (user.is_admin && adminCount <= 1)}
                              onClick={() => toggleAdmin(user.id, user.is_admin)}
                              className={`rounded-xl ${user.is_admin
                                ? 'text-red-600 border-red-200 hover:bg-red-50'
                                : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                              }`}
                            >
                              {user.is_admin
                                ? <><ShieldOff className="w-3 h-3 mr-1" /> Remove Admin</>
                                : <><Shield className="w-3 h-3 mr-1" /> Make Admin</>
                              }
                            </Button>
                          )}
                          {/* Ban/Unban — never ban yourself or last admin */}
                          {!user.is_admin && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === user.id}
                              onClick={() => handleBan(user)}
                              className={`rounded-xl ${user.is_banned
                                ? 'text-green-600 border-green-200 hover:bg-green-50'
                                : 'text-red-600 border-red-200 hover:bg-red-50'
                              }`}
                            >
                              {updating === user.id ? '...' : user.is_banned
                                ? <><CheckCircle className="w-3 h-3 mr-1" /> Unban</>
                                : <><Ban className="w-3 h-3 mr-1" /> Ban</>
                              }
                            </Button>
                          )}
                        </div>
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