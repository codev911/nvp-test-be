import { AppHealth } from '../../src/controllers/app.controller';
import { createMockRequest, createMockResponse } from '../utils';

describe('app.controller', () => {
  it('responds with health payload', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    AppHealth(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Server is live!');
    expect(payload.data?.status).toBe('healthy');
  });
});
