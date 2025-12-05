import { health } from '../../src/services/app.service';

describe('app.service', () => {
  it('returns health message', () => {
    expect(health()).toBe('Server is live!');
  });
});
