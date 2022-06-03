import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/upsertObject';

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
