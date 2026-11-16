export function getJwtSecret(): string {
  const secret =
    import.meta.env.JWT_SECRET ||
    (typeof process !== 'undefined' ? process.env.JWT_SECRET : undefined);

  if (!secret) {
    if (import.meta.env.PROD) {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    return 'dev-only-local-jwt-secret';
  }

  return secret;
}
