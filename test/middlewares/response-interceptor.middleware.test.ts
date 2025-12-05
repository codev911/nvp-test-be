import { responseInterceptor } from '../../src/middlewares/response-interceptor.middleware';
import { createMockRequest, createMockResponse } from '../utils';

describe('response-interceptor.middleware', () => {
  it('wraps success responses', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = jest.fn();
    const baseJson = res.json as jest.Mock;
    responseInterceptor(req, res, next);

    const payload = { message: 'ok', data: { a: 1 }, pagination: { total_data: 1, total_page: 1, page: 1, limit: 10 } };
    res.json(payload);

    const jsonPayload = baseJson.mock.calls[0][0];
    expect(jsonPayload.status).toBe('success');
    expect(jsonPayload.data).toEqual({ a: 1 });
    expect(next).toHaveBeenCalled();
  });

  it('wraps error responses', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    res.statusCode = 500;
    const next = jest.fn();
    const baseJson = res.json as jest.Mock;
    responseInterceptor(req, res, next);
    res.json({ message: 'Bad' });
    const jsonPayload = baseJson.mock.calls[0][0];
    expect(jsonPayload.status).toBe('error');
    expect(jsonPayload.message).toBe('Bad');
  });

  it('wraps error responses without message', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    res.statusCode = 404;
    const baseJson = res.json as jest.Mock;
    responseInterceptor(req, res, jest.fn());
    res.json({});
    const jsonPayload = baseJson.mock.calls[0][0];
    expect(jsonPayload.status).toBe('error');
    expect(jsonPayload.message).toBe('Not Found');
  });

  it('handles non-object success payload', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = jest.fn();
    const baseJson = res.json as jest.Mock;
    responseInterceptor(req, res, next);
    res.json('ok');
    const payload = baseJson.mock.calls[0][0];
    expect(payload.data).toBe('ok');
  });

  it('handles empty success payload', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = jest.fn();
    const baseJson = res.json as jest.Mock;
    responseInterceptor(req, res, next);
    res.json({});
    const payload = baseJson.mock.calls[0][0];
    expect(payload.message).toBe('Success');
  });
});
