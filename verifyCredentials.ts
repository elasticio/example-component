import Client from './src/Client';

export = async function verifyCredentials(cfg: any) {
  const client = new Client(this, cfg);
  try {
    await client.apiRequest({ method: 'GET', url: '/users/me' });
    this.logger.info('Verification completed successfully');
    return { verified: true };
  } catch (e) {
    this.logger.error('Verification failed');
    this.logger.error(JSON.stringify(e.response.data));
    throw new Error(e.response.data.message);
  }
}
