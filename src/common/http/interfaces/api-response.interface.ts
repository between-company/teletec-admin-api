export interface ApiSuccessResponse<T, M = unknown> {
    success: true
    data: T
    meta?: M
}
  
export interface ApiError {
    statusCode: number
    code: string
    message: string
    details?: unknown
}

export interface ApiErrorResponse {
    success: false
    error: ApiError
}

export type ApiResponse<T, M = unknown> =
| ApiSuccessResponse<T, M>
| ApiErrorResponse