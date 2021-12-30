import ExampleClient from './src/client';

export = async function verifyCredentials(cfg: any) {
  const client = new ExampleClient(this, cfg);
  try {
    await client.apiRequest({ method: 'GET', url: '/' });
    this.logger.info('Verification completed successfully');
    return { verified: true };
  } catch (e) {
    this.logger.error('Verification failed');
    throw e;
  }
}
