export type GrantSource = 'role' | 'area' | 'direct'

export interface GrantRow {
  key: string
  name: string
  source: GrantSource
  roleKey: string | null
  roleName: string | null
  throughRoleKey: string | null
  throughRoleName: string | null
  areaId: string | null
  areaName: string | null
}

export interface AssignedRoleRow {
  id: string
  key: string
  name: string
}
