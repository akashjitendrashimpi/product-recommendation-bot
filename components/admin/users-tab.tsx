"use client"

import type { UserProfile } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Users, Shield } from "lucide-react"
import { useState } from "react"

interface UsersTabProps {
  users: UserProfile[]
  onSelectUser: (userId: number | null) => void
  selectedUserId: number | null
}

export function UsersTab({ users, onSelectUser, selectedUserId }: UsersTabProps) {
  const [userList, setUserList] = useState(users)

  const toggleAdmin = async (user: UserProfile) => {
    try {
      const response = await fetch(`/api/users/${user.id}/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !user.is_admin }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update user")
      }

      const { user: updated } = await response.json()
      setUserList((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
    } catch (error) {
      console.error("Error updating user:", error)
      alert(error instanceof Error ? error.message : "Error updating user")
    }
  }

  const getInitials = (user: UserProfile) => {
    if (user.display_name) {
      return user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">All Users</h2>
        <p className="text-muted-foreground">Manage user accounts and view their dashboards</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {userList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users registered yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>

                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((user) => (
                  <TableRow key={user.id} className={selectedUserId === user.id ? "bg-muted/50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={user.is_admin ? "bg-destructive text-destructive-foreground" : ""}>
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.display_name || "Unnamed"}</span>
                      </div>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? "destructive" : "secondary"}>
                        {user.is_admin ? "Admin" : "user"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAdmin(user)}
                          title={user.is_admin ? "Remove admin" : "Make admin"}
                        >
                          <Shield className={`w-4 h-4 ${user.is_admin ? "text-destructive" : ""}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
