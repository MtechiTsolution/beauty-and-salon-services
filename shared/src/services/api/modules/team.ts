import { apiRequest } from '../client';
import type { SalonAdminPermission, SalonAdminRoleKey } from '../../../lib/salon-admin-permissions';

export type BranchAccessEntry = {
  branch_id: string;
  branch_name: string;
  role_key: SalonAdminRoleKey | 'owner';
  permissions: SalonAdminPermission[];
};

export type AdminBranchAccess = {
  is_owner: boolean;
  branches: BranchAccessEntry[];
};

export type SalonAdminRoleOption = {
  id: string;
  role_key: SalonAdminRoleKey;
  name: string;
  description: string | null;
};

export type BranchTeamMember = {
  id: string;
  branch_id: string;
  user_id: string;
  role_id: string;
  status: 'active' | 'disabled';
  invited_by: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  role_key: SalonAdminRoleKey;
  role_name: string;
  branch_name: string;
  created_at: string;
  updated_at: string;
};

export type BranchTeamInvite = {
  id: string;
  branch_id: string;
  email: string;
  role_id: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invited_by: string;
  expires_at: string;
  role_key: SalonAdminRoleKey;
  role_name: string;
  branch_name: string;
  created_at: string;
};

export const teamApi = {
  getRoles() {
    return apiRequest<SalonAdminRoleOption[]>('/team/roles');
  },
  listMembers(branchId: string) {
    return apiRequest<{ members: BranchTeamMember[]; invites: BranchTeamInvite[] }>(
      `/team/members?branch_id=${encodeURIComponent(branchId)}`,
    );
  },
  invite(input: { branch_id: string; email: string; role_key: SalonAdminRoleKey }) {
    return apiRequest<{ ok: true; invite: BranchTeamInvite; emailSent: boolean }>('/team/invites', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateMember(
    memberId: string,
    input: { branch_id: string; role_key?: SalonAdminRoleKey; status?: 'active' | 'disabled' },
  ) {
    return apiRequest<{ ok: true }>(`/team/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  removeMember(memberId: string, branchId: string) {
    return apiRequest<void>(
      `/team/members/${memberId}?branch_id=${encodeURIComponent(branchId)}`,
      { method: 'DELETE' },
    );
  },
  revokeInvite(inviteId: string, branchId: string) {
    return apiRequest<void>(
      `/team/invites/${inviteId}?branch_id=${encodeURIComponent(branchId)}`,
      { method: 'DELETE' },
    );
  },
  validateInvite(token: string) {
    return apiRequest<
      | { valid: true; email: string; branch_name: string; role_name: string; expires_at: string }
      | { valid: false; message: string }
    >(`/team/invites/validate?token=${encodeURIComponent(token)}`);
  },
  acceptInvite(input: { token: string; full_name: string; password: string; phone?: string }) {
    return apiRequest<{ ok: true; user_id: string; message: string }>('/team/invites/accept', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
