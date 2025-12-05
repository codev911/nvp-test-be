import { errorHandler, notFoundHandler } from '../../src/middlewares/error-handler.middleware';
import { createMockRequest, createMockResponse } from '../utils';

describe('error-handler.middleware', () => {
  it('handles server errors', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    errorHandler(new Error('fail'), req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles client errors', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    errorHandler({ message: 'bad', statusCode: 400 } as any, req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles 404', () => {
    const req = createMockRequest({}, {}, {}, 'GET', '/missing');
    const res = createMockResponse();
    notFoundHandler(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles non-error status', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    errorHandler({ message: 'info', statusCode: 200 } as any, req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
