import { expect } from 'chai';
import { processAction } from '../../src/actions/deleteObjectById';
import { getContext, creds } from '../common';

describe('deleteObjectById', () => {
  it('should deleteObjectById', async () => {
    const cfg = {
      objectType: 'users',
    };
    const msg = { body: { idValue: 123 } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.equal();
  });
});
