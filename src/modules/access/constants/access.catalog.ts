import { PERMISSIONS, ROLE_KEYS } from './access.constants.js'

/**
 * Catálogo de acceso.
 * Cada rol declara solo los permisos que agrega. `includes` arrastra el resto.
 * Ver una OT de su gerencia o solo las asignadas es alcance de datos, no una clave.
 * El tope de una orden, las 24 horas de una OT y el bloqueo de bolsa tampoco son claves.
 */

const KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/

type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS]

export interface PermissionSeed {
  key: PermissionKey
  name: string
  module: string
}

export interface RoleSeed {
  key: RoleKey
  name: string
  includes: RoleKey[]
  permissions: PermissionKey[]
}

export interface AreaSeed {
  name: string
  roleKey: RoleKey
}

const P = PERMISSIONS

export const PERMISSION_CATALOG: PermissionSeed[] = [
  {
    key: P.USERS_READ,
    name: 'Consultar usuarios',
    module: 'users',
  },
  {
    key: P.USERS_INVITE,
    name: 'Invitar usuarios',
    module: 'users',
  },
  {
    key: P.USERS_UPDATE,
    name: 'Editar usuarios',
    module: 'users',
  },
  {
    key: P.USERS_DELETE,
    name: 'Borrar y restaurar usuarios',
    module: 'users',
  },
  {
    key: P.USERS_PAUSE,
    name: 'Activar y pausar usuarios',
    module: 'users',
  },
  {
    key: P.AREAS_READ,
    name: 'Consultar áreas',
    module: 'areas',
  },
  {
    key: P.AREAS_MANAGE,
    name: 'Administrar áreas',
    module: 'areas',
  },
  {
    key: P.PERMISSIONS_ASSIGN,
    name: 'Asignar roles y permisos',
    module: 'access',
  },
  {
    key: P.CLIENTS_CREATE,
    name: 'Alta de clientes',
    module: 'clients',
  },
  {
    key: P.CLIENTS_READ,
    name: 'Consultar clientes',
    module: 'clients',
  },
  {
    key: P.CLIENT_CONTACTS_CREATE,
    name: 'Alta de contactos del cliente',
    module: 'clients',
  },
  {
    key: P.CLIENT_CONTACTS_READ,
    name: 'Consultar contactos del cliente',
    module: 'clients',
  },
  {
    key: P.WORK_ORDERS_CREATE,
    name: 'Alta de órdenes de trabajo',
    module: 'work-orders',
  },
  {
    key: P.WORK_ORDERS_UPDATE,
    name: 'Modificar órdenes de trabajo',
    module: 'work-orders',
  },
  {
    key: P.WORK_ORDERS_READ,
    name: 'Consultar órdenes de trabajo',
    module: 'work-orders',
  },
  {
    key: P.WORK_ORDERS_AUTHORIZE,
    name: 'Autorizar órdenes de trabajo',
    module: 'work-orders',
  },
  {
    key: P.PURCHASE_ORDERS_CREATE,
    name: 'Alta de órdenes de compra',
    module: 'purchase-orders',
  },
  {
    key: P.PURCHASE_ORDERS_UPDATE,
    name: 'Modificar órdenes de compra pendientes',
    module: 'purchase-orders',
  },
  {
    key: P.PURCHASE_ORDERS_READ,
    name: 'Consultar órdenes de compra',
    module: 'purchase-orders',
  },
  {
    key: P.PURCHASE_ORDERS_AUTHORIZE,
    name: 'Autorizar órdenes de compra',
    module: 'purchase-orders',
  },
  {
    key: P.PURCHASE_ORDERS_DECIDE,
    name: 'Modificar o rechazar órdenes de compra',
    module: 'purchase-orders',
  },
  {
    key: P.PURCHASE_ORDERS_DELETE,
    name: 'Eliminar órdenes de compra',
    module: 'purchase-orders',
  },
  {
    key: P.SUPERVISORS_CREATE,
    name: 'Alta de supervisores',
    module: 'supervisors',
  },
  {
    key: P.SUPERVISORS_READ,
    name: 'Consultar supervisores',
    module: 'supervisors',
  },
  {
    key: P.SUPERVISORS_ASSIGN,
    name: 'Asignar supervisores a la OT',
    module: 'supervisors',
  },
  {
    key: P.SUPERVISORS_BUDGET,
    name: 'Definir bolsa y consumo semanal',
    module: 'supervisors',
  },
  {
    key: P.CONTRACTORS_CREATE,
    name: 'Alta de contratistas',
    module: 'contractors',
  },
  {
    key: P.CONTRACTORS_READ,
    name: 'Consultar contratistas',
    module: 'contractors',
  },
  {
    key: P.CONTRACTS_CREATE,
    name: 'Alta de contratos en la OT',
    module: 'contracts',
  },
  {
    key: P.CONTRACTS_UPDATE,
    name: 'Modificar contratos pendientes',
    module: 'contracts',
  },
  {
    key: P.CONTRACTS_READ,
    name: 'Consultar contratos',
    module: 'contracts',
  },
  {
    key: P.CONTRACTS_AUTHORIZE,
    name: 'Autorizar contratos',
    module: 'contracts',
  },
  {
    key: P.CONTRACTS_REVISE,
    name: 'Modificar contratos autorizados',
    module: 'contracts',
  },
  {
    key: P.CONTRACTOR_STAFF_MANAGE,
    name: 'Administrar personal del contratista',
    module: 'contractors',
  },
  {
    key: P.CONTRACTOR_STAFF_READ,
    name: 'Consultar personal del contratista',
    module: 'contractors',
  },
  {
    key: P.CONTRACTOR_STAFF_AUTHORIZE,
    name: 'Autorizar personal del contratista',
    module: 'contractors',
  },
  {
    key: P.CONTRACTOR_PAYMENTS_CREATE,
    name: 'Cargar pago semanal de contratista',
    module: 'payments',
  },
  {
    key: P.CONTRACTOR_PAYMENTS_UPDATE,
    name: 'Modificar pago semanal de contratista',
    module: 'payments',
  },
  {
    key: P.CONTRACTOR_PAYMENTS_READ,
    name: 'Consultar pagos de contratistas',
    module: 'payments',
  },
  {
    key: P.CONTRACTOR_PAYMENTS_AUTHORIZE,
    name: 'Autorizar pagos de contratistas',
    module: 'payments',
  },
  {
    key: P.CONTRACTOR_PAYMENTS_DELETE,
    name: 'Eliminar pagos de contratistas',
    module: 'payments',
  },
  {
    key: P.SUPERVISOR_PAYMENTS_CREATE,
    name: 'Cargar pago semanal de supervisor',
    module: 'payments',
  },
  {
    key: P.SUPERVISOR_PAYMENTS_UPDATE,
    name: 'Modificar pago semanal de supervisor',
    module: 'payments',
  },
  {
    key: P.SUPERVISOR_PAYMENTS_READ,
    name: 'Consultar pagos de supervisores',
    module: 'payments',
  },
  {
    key: P.SUPERVISOR_PAYMENTS_AUTHORIZE,
    name: 'Autorizar pagos de supervisores',
    module: 'payments',
  },
  {
    key: P.SUPERVISOR_PAYMENTS_DELETE,
    name: 'Eliminar pagos de supervisores',
    module: 'payments',
  },
  {
    key: P.BAGS_READ,
    name: 'Consultar bolsas de la OT',
    module: 'bags',
  },
  {
    key: P.BAGS_REQUEST,
    name: 'Solicitar ampliación de bolsa',
    module: 'bags',
  },
  {
    key: P.BAGS_AUTHORIZE,
    name: 'Autorizar cambios de bolsa',
    module: 'bags',
  },
  {
    key: P.COMMISSIONS_READ,
    name: 'Consultar comisiones',
    module: 'commissions',
  },
  {
    key: P.COMMISSIONS_GENERATE,
    name: 'Generar hoja de comisiones',
    module: 'commissions',
  },
  {
    key: P.COMMISSIONS_UPDATE,
    name: 'Ajustar porcentaje de comisión',
    module: 'commissions',
  },
  {
    key: P.COMMISSIONS_SUBMIT,
    name: 'Enviar comisiones a autorización',
    module: 'commissions',
  },
  {
    key: P.COMMISSIONS_AUTHORIZE,
    name: 'Autorizar comisiones',
    module: 'commissions',
  },
  {
    key: P.COMMISSIONS_PROCESS,
    name: 'Procesar comisiones autorizadas',
    module: 'commissions',
  },
  {
    key: P.PAYROLL_READ,
    name: 'Consultar pagos de nómina',
    module: 'payroll',
  },
  {
    key: P.PAYROLL_REGISTER,
    name: 'Registrar pago quincenal de nómina',
    module: 'payroll',
  },
  {
    key: P.COLLECTIONS_READ,
    name: 'Consultar cobranza de la OT',
    module: 'collections',
  },
  {
    key: P.COLLECTIONS_REGISTER,
    name: 'Registrar pagos de clientes',
    module: 'collections',
  },
  {
    key: P.TREASURY_READ,
    name: 'Consultar pagos por ejecutar',
    module: 'treasury',
  },
  {
    key: P.TREASURY_SETTLE,
    name: 'Confirmar pago o no pago',
    module: 'treasury',
  },
  {
    key: P.CATALOGS_READ,
    name: 'Consultar catálogos',
    module: 'catalogs',
  },
  {
    key: P.CATALOGS_MANAGE,
    name: 'Administrar catálogos',
    module: 'catalogs',
  },
  { key: P.CLIENTS_UPDATE, name: 'Editar clientes', module: 'clients' },
  { key: P.CLIENTS_DELETE, name: 'Borrar clientes', module: 'clients' },
  { key: P.CLIENT_CONTACTS_UPDATE, name: 'Editar contactos de clientes', module: 'client-contacts' },
  { key: P.CLIENT_CONTACTS_DELETE, name: 'Borrar contactos de clientes', module: 'client-contacts' },
]

const vendedor: PermissionKey[] = [
  P.CLIENTS_CREATE,
  P.CLIENTS_READ,
  P.CLIENT_CONTACTS_CREATE,
  P.CLIENT_CONTACTS_READ,
  P.WORK_ORDERS_CREATE,
  P.WORK_ORDERS_UPDATE,
  P.WORK_ORDERS_READ,
]

const gerente: PermissionKey[] = [
  P.WORK_ORDERS_AUTHORIZE,
  P.PURCHASE_ORDERS_CREATE,
  P.PURCHASE_ORDERS_UPDATE,
  P.PURCHASE_ORDERS_READ,
  P.PURCHASE_ORDERS_AUTHORIZE,
  P.SUPERVISORS_CREATE,
  P.SUPERVISORS_READ,
  P.SUPERVISORS_ASSIGN,
  P.SUPERVISORS_BUDGET,
  P.CONTRACTORS_CREATE,
  P.CONTRACTORS_READ,
  P.CONTRACTS_CREATE,
  P.CONTRACTS_UPDATE,
  P.CONTRACTS_READ,
  P.CONTRACTOR_STAFF_MANAGE,
  P.CONTRACTOR_STAFF_READ,
  P.CONTRACTOR_PAYMENTS_CREATE,
  P.CONTRACTOR_PAYMENTS_UPDATE,
  P.CONTRACTOR_PAYMENTS_READ,
  P.SUPERVISOR_PAYMENTS_CREATE,
  P.SUPERVISOR_PAYMENTS_UPDATE,
  P.SUPERVISOR_PAYMENTS_READ,
  P.BAGS_READ,
  P.BAGS_REQUEST,
]

const gerenteVentas: PermissionKey[] = [
  P.COMMISSIONS_READ,
  P.COMMISSIONS_GENERATE,
  P.COMMISSIONS_UPDATE,
  P.COMMISSIONS_SUBMIT,
]

const supervisor: PermissionKey[] = [
  P.WORK_ORDERS_READ,
  P.CONTRACTORS_READ,
  P.CONTRACTS_READ,
  P.CONTRACTOR_PAYMENTS_CREATE,
  P.CONTRACTOR_PAYMENTS_UPDATE,
  P.CONTRACTOR_PAYMENTS_READ,
  P.SUPERVISOR_PAYMENTS_CREATE,
  P.SUPERVISOR_PAYMENTS_UPDATE,
  P.SUPERVISOR_PAYMENTS_READ,
  P.BAGS_READ,
  P.BAGS_REQUEST,
]

const director: PermissionKey[] = [
  P.PURCHASE_ORDERS_DECIDE,
  P.PURCHASE_ORDERS_DELETE,
  P.CONTRACTS_AUTHORIZE,
  P.CONTRACTS_REVISE,
  P.CONTRACTOR_PAYMENTS_AUTHORIZE,
  P.CONTRACTOR_PAYMENTS_DELETE,
  P.SUPERVISOR_PAYMENTS_AUTHORIZE,
  P.SUPERVISOR_PAYMENTS_DELETE,
  P.BAGS_AUTHORIZE,
  P.COMMISSIONS_AUTHORIZE,
]

const rh: PermissionKey[] = [
  P.CONTRACTOR_STAFF_READ,
  P.CONTRACTOR_STAFF_AUTHORIZE,
  P.PAYROLL_READ,
  P.PAYROLL_REGISTER,
  P.COMMISSIONS_READ,
  P.COMMISSIONS_PROCESS,
  P.BAGS_READ,
  P.CONTRACTS_READ,
]

const cuentasCobrar: PermissionKey[] = [
  P.COLLECTIONS_READ,
  P.COLLECTIONS_REGISTER,
  P.WORK_ORDERS_READ,
  P.BAGS_READ,
]

const tesoreria: PermissionKey[] = [
  P.TREASURY_READ,
  P.TREASURY_SETTLE,
  P.PURCHASE_ORDERS_READ,
  P.CONTRACTOR_PAYMENTS_READ,
  P.SUPERVISOR_PAYMENTS_READ,
]

const administrador: PermissionKey[] = [
  P.CLIENTS_UPDATE,
  P.CLIENTS_DELETE,
  P.CLIENT_CONTACTS_UPDATE,
  P.CLIENT_CONTACTS_DELETE,
  P.USERS_READ,
  P.USERS_INVITE,
  P.USERS_UPDATE,
  P.USERS_DELETE,
  P.USERS_PAUSE,
  P.AREAS_READ,
  P.AREAS_MANAGE,
  P.PERMISSIONS_ASSIGN,
  P.CATALOGS_READ,
  P.CATALOGS_MANAGE,
]

export const ROLE_CATALOG: RoleSeed[] = [
  {
    key: ROLE_KEYS.VENDEDOR,
    name: 'Vendedor',
    includes: [],
    permissions: vendedor,
  },
  {
    key: ROLE_KEYS.GERENTE,
    name: 'Gerente',
    includes: [ROLE_KEYS.VENDEDOR],
    permissions: gerente,
  },
  {
    key: ROLE_KEYS.GERENTE_VENTAS,
    name: 'Gerente de ventas',
    includes: [ROLE_KEYS.GERENTE],
    permissions: gerenteVentas,
  },
  {
    key: ROLE_KEYS.SUPERVISOR,
    name: 'Supervisor',
    includes: [],
    permissions: supervisor,
  },
  {
    key: ROLE_KEYS.DIRECTOR,
    name: 'Director',
    includes: [ROLE_KEYS.GERENTE_VENTAS],
    permissions: director,
  },
  {
    key: ROLE_KEYS.RH,
    name: 'RH',
    includes: [],
    permissions: rh,
  },
  {
    key: ROLE_KEYS.CUENTAS_COBRAR,
    name: 'Cuentas por cobrar',
    includes: [],
    permissions: cuentasCobrar,
  },
  {
    key: ROLE_KEYS.TESORERIA,
    name: 'Tesorería',
    includes: [],
    permissions: tesoreria,
  },
  {
    key: ROLE_KEYS.ADMINISTRADOR,
    name: 'Administrador',
    includes: [
      ROLE_KEYS.DIRECTOR,
      ROLE_KEYS.RH,
      ROLE_KEYS.CUENTAS_COBRAR,
      ROLE_KEYS.TESORERIA,
    ],
    permissions: administrador,
  },
  {
    key: ROLE_KEYS.ADMIN,
    name: 'Admin',
    includes: [ROLE_KEYS.ADMINISTRADOR],
    permissions: [],
  },
  {
    key: ROLE_KEYS.SUPERADMIN,
    name: 'Superadmin',
    includes: [ROLE_KEYS.ADMIN],
    permissions: [],
  },
]

export const AREA_CATALOG: AreaSeed[] = [
  { name: 'Ventas', roleKey: ROLE_KEYS.VENDEDOR },
  { name: 'Gerencia', roleKey: ROLE_KEYS.GERENTE },
  { name: 'Gerencia de ventas', roleKey: ROLE_KEYS.GERENTE_VENTAS },
  { name: 'Supervisión', roleKey: ROLE_KEYS.SUPERVISOR },
  { name: 'Dirección', roleKey: ROLE_KEYS.DIRECTOR },
  { name: 'Recursos humanos', roleKey: ROLE_KEYS.RH },
  { name: 'Credito y cobranzas', roleKey: ROLE_KEYS.CUENTAS_COBRAR },
  { name: 'Finanzas', roleKey: ROLE_KEYS.TESORERIA },
  { name: 'Administración', roleKey: ROLE_KEYS.ADMINISTRADOR },
]

const roleByKey = new Map(ROLE_CATALOG.map((role) => [role.key, role]))

export function effectivePermissions(roleKey: RoleKey): PermissionKey[] {
  const keys = new Set<PermissionKey>()

  const visit = (key: RoleKey, stack: Set<RoleKey>) => {
    const role = roleByKey.get(key)

    if (!role || stack.has(key)) {
      return
    }

    stack.add(key)

    for (const permission of role.permissions) {
      keys.add(permission)
    }

    for (const included of role.includes) {
      visit(included, stack)
    }

    stack.delete(key)
  }

  visit(roleKey, new Set())

  return [...keys].sort()
}

export function assertAccessCatalog(): void {
  const catalogKeys = new Set(PERMISSION_CATALOG.map((item) => item.key))
  const missing = Object.values(PERMISSIONS).filter(
    (key) => !catalogKeys.has(key),
  )

  if (catalogKeys.size !== PERMISSION_CATALOG.length || missing.length > 0) {
    throw new Error(
      `El catálogo de permisos no coincide con las constantes: ${missing.join(', ')}`,
    )
  }

  for (const item of PERMISSION_CATALOG) {
    if (
      !KEY_PATTERN.test(item.key) ||
      item.key.length > 150 ||
      item.name.length === 0 ||
      item.name.length > 150 ||
      item.module.length === 0 ||
      item.module.length > 100
    ) {
      throw new Error(`Permiso inválido: ${item.key}`)
    }
  }

  const visiting = new Set<RoleKey>()

  const visit = (key: RoleKey) => {
    const role = roleByKey.get(key)

    if (!role) {
      throw new Error(`Rol desconocido: ${key}`)
    }

    if (visiting.has(key)) {
      throw new Error(`Ciclo de roles en ${key}`)
    }

    if (!KEY_PATTERN.test(role.key) || role.name.length > 150) {
      throw new Error(`Rol inválido: ${role.key}`)
    }

    visiting.add(key)

    for (const included of role.includes) {
      visit(included)
    }

    visiting.delete(key)
  }

  for (const role of ROLE_CATALOG) {
    visit(role.key)
  }

  const areaNames = new Set<string>()

  for (const area of AREA_CATALOG) {
    if (
      area.name.length === 0 ||
      area.name.length > 150 ||
      areaNames.has(area.name) ||
      !roleByKey.has(area.roleKey)
    ) {
      throw new Error(`Área inválida: ${area.name}`)
    }

    areaNames.add(area.name)
  }
}
