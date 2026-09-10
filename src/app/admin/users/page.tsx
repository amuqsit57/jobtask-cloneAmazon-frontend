'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RoleShell, ADMIN_NAV } from '@/components/RoleShell';
import { getAdminUsers, setUserRole } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { AdminUser, Role } from '@/lib/types';

const ROLES: Role[] = ['customer', 'seller', 'admin'];

function UsersTable() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const [filter, setFilter] = useState<string>(params.get('role') ?? '');
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [promoting, setPromoting] = useState<number | null>(null);
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!session?.apiToken) return;
    setUsers(null);
    getAdminUsers(session.apiToken, filter || undefined)
      .then((r) => setUsers(r.users))
      .catch(() => setUsers([]));
  };
  useEffect(load, [session, filter]);

  async function change(id: number, role: Role, store?: string) {
    if (!session?.apiToken) return;
    setError(null);
    try {
      await setUserRole(id, role, store, session.apiToken);
      setPromoting(null);
      setStoreName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change the role');
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={filter === '' ? 'btn-amazon' : 'btn-secondary'}
        >
          Everyone
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={filter === r ? 'btn-amazon' : 'btn-secondary'}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}s
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded border border-[#c40000] bg-[#fff5f5] p-2 text-[13px] text-[#c40000]">
          {error}
        </p>
      )}

      {!users ? (
        <p className="text-[14px]">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#d5d9d9] bg-[#f7fafa] text-left">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3">Change role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3">
                    <p className="font-bold">{u.name}</p>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      {u.email}
                    </p>
                    {u.storeName && (
                      <p className="text-[12px] text-[var(--color-link)]">
                        {u.storeName}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-[#232F3E] px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                      {u.role}
                    </span>
                    {u.isPrime && (
                      <span className="ml-1 text-[11px] font-bold italic text-[#00A8E1]">
                        prime
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[12px]">{formatOrderDate(u.createdAt)}</td>
                  <td className="p-3 text-right">{u.orderCount}</td>
                  <td className="p-3 text-right">{u.lifetimeSpendFormatted}</td>
                  <td className="p-3">
                    {promoting === u.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Store name"
                          className="input-amazon w-44"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => change(u.id, 'seller', storeName)}
                            className="btn-amazon !py-1"
                          >
                            Make seller
                          </button>
                          <button
                            onClick={() => setPromoting(null)}
                            className="btn-secondary !py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.role !== 'seller' && (
                          <button
                            onClick={() => {
                              setPromoting(u.id);
                              setStoreName(`${u.name}'s Store`);
                            }}
                            className="btn-secondary !py-1"
                          >
                            → Seller
                          </button>
                        )}
                        {u.role !== 'customer' && (
                          <button
                            onClick={() => change(u.id, 'customer')}
                            className="btn-secondary !py-1"
                          >
                            → Customer
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => change(u.id, 'admin')}
                            className="btn-secondary !py-1"
                          >
                            → Admin
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminUsers() {
  return (
    <RoleShell role="admin" title="Users" nav={ADMIN_NAV}>
      <Suspense fallback={<p className="text-[14px]">Loading…</p>}>
        <UsersTable />
      </Suspense>
    </RoleShell>
  );
}
