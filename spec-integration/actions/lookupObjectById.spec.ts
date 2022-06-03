import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/lookupObjectById';

describe('lookupObjectById', () => {
  it('should lookupObjectById', async () => {
    const cfg = {
      objectType: 'users',
    };
    const msg = { body: { idValue: 123 } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.equal();
  });
});
