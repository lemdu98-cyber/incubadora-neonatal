import { configureCors } from './cors.config';

describe('configureCors', () => {
  it('allows only the configured frontend origin and explicit API surface', () => {
    const enableCors = jest.fn();

    configureCors({ enableCors } as never, 'http://localhost:3000');

    expect(enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    expect(enableCors).not.toHaveBeenCalledWith(
      expect.objectContaining({ origin: '*' }),
    );
  });
});
