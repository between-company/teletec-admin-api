import type {
    PaginatedMeta,
    PaginationMeta
  } from '../interfaces/pagination.interface.js'
  
  const API_PAYLOAD = Symbol('API_PAYLOAD')
  
  export interface ApiPayload<T, M> {
    readonly [API_PAYLOAD]: true
    data: T
    meta: M
  }
  
  export const withMeta = <T, M>(
    data: T,
    meta: M
  ): ApiPayload<T, M> => ({
    [API_PAYLOAD]: true,
    data,
    meta
  })
  
  export const isApiPayload = (
    value: unknown
  ): value is ApiPayload<unknown, unknown> => {
    return (
      typeof value === 'object' &&
      value !== null &&
      API_PAYLOAD in value
    )
  }
  
  interface CreatePaginationOptions {
    page: number
    limit: number
    totalItems: number
  }
  
  export const createPaginationMeta = ({
    page,
    limit,
    totalItems
  }: CreatePaginationOptions): PaginationMeta => {
    const totalPages = Math.ceil(totalItems / limit)
  
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }
  
  export const paginated = <T>(
    data: T[],
    pagination: PaginationMeta
  ): ApiPayload<T[], PaginatedMeta> => {
    return withMeta(data, {
      pagination
    })
  }