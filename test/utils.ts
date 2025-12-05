import type { Request, Response } from 'express';

export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    locals: {},
    statusCode: 200,
  } as unknown as Response;
  return res;
}

export function createMockRequest(body: any = {}, query: any = {}, headers: any = {}, method = 'GET', originalUrl = '/') {
  const req = {
    body,
    query,
    headers,
    method,
    originalUrl,
    ip: '127.0.0.1',
    pipe: jest.fn(),
  } as unknown as Request;
  return req;
}
