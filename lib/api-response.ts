import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

export function errorResponse(error: any, status?: number) {
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: status || 500 }
    )
  }

  if (typeof error === 'object' && error.message && error.status) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.status }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: error,
    },
    { status: status || 500 }
  )
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404)
}

export function badRequestResponse(message = 'Bad request') {
  return errorResponse(message, 400)
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401)
}

export const CommonErrors = {
  Unauthorized: { message: 'Unauthorized', status: 401 },
  Forbidden: { message: 'Forbidden', status: 403 },
  NotFound: { message: 'Not found', status: 404 },
  BadRequest: { message: 'Bad request', status: 400 },
  InternalError: { message: 'Internal server error', status: 500 },
}
