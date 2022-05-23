import { expect } from 'chai';
import { processAction } from '../../src/actions/lookupObjectById';
import { getContext, creds } from '../common';

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
