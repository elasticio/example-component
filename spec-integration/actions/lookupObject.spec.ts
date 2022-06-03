import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/lookupObject';

describe('lookupObject', () => {
  it('should lookupObject', async () => {
    const cfg = {
      objectType: 'users',
      lookupCriteria: 'id',
    };
    const msg = { body: { lookupCriteriaValue: 123 } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.equal();
  });
});
