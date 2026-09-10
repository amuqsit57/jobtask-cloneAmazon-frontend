'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, ADMIN_NAV } from '@/components/RoleShell';
import { getAdminActions } from '@/lib/api';
import type { AdminAction } from '@/lib/types';

const LABELS: Record<string, string> = {
  approve: 'Approved a listing',
  reject: 'Rejected a listing',
  archive: 'Archived a listing',
};

export default function AdminAudit() {
  const { data: session } = useSession();
  const [actions, setActions] = useState<AdminAction[] | null>(null);

  useEffect(() => {
    if (!session?.apiToken) return;
    getAdminActions(session.apiToken)
      .then((r) => setActions(r.actions))
      .catch(() => setActions([]));
  }, [session]);

  return (
    <RoleShell role="admin" title="Audit log" nav={ADMIN_NAV}>
      <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
        Every moderation decision and role change is recorded here, so an action
        can be traced back to the admin who took it.
      </p>

      {!actions ? (
        <p className="text-[14px]">Loading…</p>
      ) : actions.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-[15px]">
          Nothing has been actioned yet.
        </div>
      ) : (
        <ol className="rounded-lg border border-[#d5d9d9] bg-white">
          {actions.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-100 p-3 text-[13px] last:border-0"
            >
              <span className="font-mono text-[12px] text-[var(--color-text-secondary)]">
                {new Date(a.createdAt).toLocaleString('en-US')}
              </span>
              <span className="font-bold">{a.adminName ?? 'Unknown admin'}</span>
              <span>
                {LABELS[a.action] ??
                  (a.action.startsWith('role:')
                    ? `Set role to ${a.action.slice(5)}`
                    : a.action)}
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {a.targetType} #{a.targetId}
              </span>
              {a.note && (
                <span className="text-[12px] text-[#b12704]">&ldquo;{a.note}&rdquo;</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </RoleShell>
  );
}
