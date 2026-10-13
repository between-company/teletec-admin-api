export const ROLE_KEYS = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  VENDEDOR: 'vendedor',
  GERENTE: 'gerente',
  GERENTE_VENTAS: 'gerente-ventas',
  SUPERVISOR: 'supervisor',
  DIRECTOR: 'director',
  RH: 'rh',
  CUENTAS_COBRAR: 'cuentas-cobrar',
  TESORERIA: 'tesoreria',
  ADMINISTRADOR: 'administrador',
} as const

export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_INVITE: 'users.invite',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_PAUSE: 'users.pause',
  AREAS_READ: 'areas.read',
  AREAS_MANAGE: 'areas.manage',
  PERMISSIONS_ASSIGN: 'permissions.assign',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_READ: 'clients.read',
  CLIENT_CONTACTS_CREATE: 'client-contacts.create',
  CLIENT_CONTACTS_READ: 'client-contacts.read',
  WORK_ORDERS_CREATE: 'work-orders.create',
  WORK_ORDERS_UPDATE: 'work-orders.update',
  WORK_ORDERS_READ: 'work-orders.read',
  WORK_ORDERS_AUTHORIZE: 'work-orders.authorize',
  PURCHASE_ORDERS_CREATE: 'purchase-orders.create',
  PURCHASE_ORDERS_UPDATE: 'purchase-orders.update',
  PURCHASE_ORDERS_READ: 'purchase-orders.read',
  PURCHASE_ORDERS_AUTHORIZE: 'purchase-orders.authorize',
  PURCHASE_ORDERS_DECIDE: 'purchase-orders.decide',
  PURCHASE_ORDERS_DELETE: 'purchase-orders.delete',
  SUPERVISORS_CREATE: 'supervisors.create',
  SUPERVISORS_READ: 'supervisors.read',
  SUPERVISORS_ASSIGN: 'supervisors.assign',
  SUPERVISORS_BUDGET: 'supervisors.budget',
  CONTRACTORS_CREATE: 'contractors.create',
  CONTRACTORS_READ: 'contractors.read',
  CONTRACTS_CREATE: 'contracts.create',
  CONTRACTS_UPDATE: 'contracts.update',
  CONTRACTS_READ: 'contracts.read',
  CONTRACTS_AUTHORIZE: 'contracts.authorize',
  CONTRACTS_REVISE: 'contracts.revise',
  CONTRACTOR_STAFF_MANAGE: 'contractor-staff.manage',
  CONTRACTOR_STAFF_READ: 'contractor-staff.read',
  CONTRACTOR_STAFF_AUTHORIZE: 'contractor-staff.authorize',
  CONTRACTOR_PAYMENTS_CREATE: 'contractor-payments.create',
  CONTRACTOR_PAYMENTS_UPDATE: 'contractor-payments.update',
  CONTRACTOR_PAYMENTS_READ: 'contractor-payments.read',
  CONTRACTOR_PAYMENTS_AUTHORIZE: 'contractor-payments.authorize',
  CONTRACTOR_PAYMENTS_DELETE: 'contractor-payments.delete',
  SUPERVISOR_PAYMENTS_CREATE: 'supervisor-payments.create',
  SUPERVISOR_PAYMENTS_UPDATE: 'supervisor-payments.update',
  SUPERVISOR_PAYMENTS_READ: 'supervisor-payments.read',
  SUPERVISOR_PAYMENTS_AUTHORIZE: 'supervisor-payments.authorize',
  SUPERVISOR_PAYMENTS_DELETE: 'supervisor-payments.delete',
  BAGS_READ: 'bags.read',
  BAGS_REQUEST: 'bags.request',
  BAGS_AUTHORIZE: 'bags.authorize',
  COMMISSIONS_READ: 'commissions.read',
  COMMISSIONS_GENERATE: 'commissions.generate',
  COMMISSIONS_UPDATE: 'commissions.update',
  COMMISSIONS_SUBMIT: 'commissions.submit',
  COMMISSIONS_AUTHORIZE: 'commissions.authorize',
  COMMISSIONS_PROCESS: 'commissions.process',
  PAYROLL_READ: 'payroll.read',
  PAYROLL_REGISTER: 'payroll.register',
  COLLECTIONS_READ: 'collections.read',
  COLLECTIONS_REGISTER: 'collections.register',
  TREASURY_READ: 'treasury.read',
  TREASURY_SETTLE: 'treasury.settle',
  CATALOGS_READ: 'catalogs.read',
  CATALOGS_MANAGE: 'catalogs.manage',
} as const

export const REQUIRE_PERMISSIONS = 'require_permissions'

const RESOURCES_WHOSE_WRITES_GRANT_READ = new Set(['users'])

export function expandImpliedKeys(keys: Iterable<string>): string[] {
  const expanded = new Set(keys)

  for (const key of keys) {
    const dot = key.lastIndexOf('.')

    if (dot <= 0) {
      continue
    }

    const resource = key.slice(0, dot)
    const action = key.slice(dot + 1)

    if (action === 'read') {
      continue
    }

    if (
      action === 'manage' ||
      RESOURCES_WHOSE_WRITES_GRANT_READ.has(resource)
    ) {
      expanded.add(`${resource}.read`)
    }
  }

  return [...expanded].sort()
}
