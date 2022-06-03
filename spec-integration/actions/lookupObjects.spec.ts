import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/lookupObjects';

describe('lookupObjects', () => {
  it('should lookupObjects', async () => {
    const cfg = {
      objectType: 'users',
      emitBehavior: 'emitAll'
    };
    const msg = { body: { searchCriteria: ['userAge>25', 'userName=Alex'] } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.equal();
  });
});
