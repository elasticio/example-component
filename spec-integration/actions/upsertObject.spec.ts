import { expect } from 'chai';
import { processAction } from '../../src/actions/upsertObject';
import { getContext, creds } from '../common';

const upsertMsgBody = { email: 'email', gender: 'm' };

describe('upsertObject', () => {
  it('should upsertObject', async () => {
    const cfg = {
      objectType: 'users',
    };
    const msg = { body: { id: '123', ...upsertMsgBody } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.equal();
  });
});
