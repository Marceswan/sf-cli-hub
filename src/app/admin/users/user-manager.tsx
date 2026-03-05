"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Ban,
  Pause,
  Play,
  UserPlus,
  X,
} from "lucide-react";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function UserManager({ totalUsers }: { totalUsers: number }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: totalUsers,
    totalPages: Math.ceil(totalUsers / 20),
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{
    userId: string;
    action: string;
    label: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (roleFilter) params.set("role", roleFilter);
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/users?${params}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
          setPagination(data.pagination);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  async function updateUser(
    userId: string,
    data: { role?: string; status?: string }
  ) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update user");
      }
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  }

  async function handleInvite() {
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteResult({
          type: "success",
          message: `Invitation sent to ${inviteEmail}`,
        });
        setInviteEmail("");
        setInviteRole("user");
      } else {
        const err = await res.json();
        setInviteResult({
          type: "error",
          message: err.error || "Failed to send invitation",
        });
      }
    } finally {
      setInviteLoading(false);
    }
  }

  function roleBadge(role: string) {
    return role === "admin" ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400">
        User
      </span>
    );
  }

  function statusBadge(status: string) {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
            Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400">
            Suspended
          </span>
        );
      case "banned":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
            Banned
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={16} />
          Invite User
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0 hover:bg-bg-surface/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-muted text-xs font-medium">
                            {(user.name || user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {user.name || "Unnamed"}
                          </p>
                          <p className="text-text-muted text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">{statusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Role toggle */}
                        {user.role === "user" ? (
                          <button
                            onClick={() =>
                              setConfirm({
                                userId: user.id,
                                action: "promote",
                                label: `Promote ${user.name || user.email} to Admin?`,
                              })
                            }
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-md text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                            title="Promote to Admin"
                          >
                            <Shield size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirm({
                                userId: user.id,
                                action: "demote",
                                label: `Demote ${user.name || user.email} to User?`,
                              })
                            }
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-md text-purple-400 hover:text-text-muted hover:bg-purple-500/10 transition-colors cursor-pointer"
                            title="Demote to User"
                          >
                            <ShieldOff size={16} />
                          </button>
                        )}

                        {/* Status actions */}
                        {user.status === "active" && (
                          <>
                            <button
                              onClick={() =>
                                setConfirm({
                                  userId: user.id,
                                  action: "suspend",
                                  label: `Suspend ${user.name || user.email}?`,
                                })
                              }
                              disabled={actionLoading === user.id}
                              className="p-1.5 rounded-md text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors cursor-pointer"
                              title="Suspend"
                            >
                              <Pause size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setConfirm({
                                  userId: user.id,
                                  action: "ban",
                                  label: `Ban ${user.name || user.email}? This is a permanent action.`,
                                })
                              }
                              disabled={actionLoading === user.id}
                              className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Ban"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}

                        {(user.status === "suspended" ||
                          user.status === "banned") && (
                          <button
                            onClick={() =>
                              setConfirm({
                                userId: user.id,
                                action: "restore",
                                label: `Restore ${user.name || user.email} to active?`,
                              })
                            }
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-md text-text-muted hover:text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer"
                            title="Restore"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-bg-surface disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-bg-surface disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog Overlay */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card border border-border rounded-card p-6 max-w-sm w-full mx-4">
            <p className="text-sm mb-4">{confirm.label}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="px-3 py-1.5 rounded-lg bg-bg-surface border border-border text-sm cursor-pointer hover:bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { userId, action } = confirm;
                  switch (action) {
                    case "promote":
                      updateUser(userId, { role: "admin" });
                      break;
                    case "demote":
                      updateUser(userId, { role: "user" });
                      break;
                    case "suspend":
                      updateUser(userId, { status: "suspended" });
                      break;
                    case "ban":
                      updateUser(userId, { status: "banned" });
                      break;
                    case "restore":
                      updateUser(userId, { status: "active" });
                      break;
                  }
                }}
                disabled={actionLoading !== null}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal Overlay */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card border border-border rounded-card p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Invite User</h3>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setInviteResult(null);
                  setInviteEmail("");
                }}
                className="p-1 rounded-md text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "user" | "admin")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {inviteResult && (
                <p
                  className={`text-sm ${
                    inviteResult.type === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {inviteResult.message}
                </p>
              )}

              <button
                onClick={handleInvite}
                disabled={!inviteEmail || inviteLoading}
                className="w-full px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
