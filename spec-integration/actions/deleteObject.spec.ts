import { expect } from 'chai';
import { processAction } from '../../src/actions/deleteObject';
import { getContext, creds } from '../common';

describe('deleteObject', () => {
  it('should deleteObject', async () => {
    const cfg = {
      objectType: 'users',
      lookupCriteria: 'id'
    };
    const msg = { body: { lookupCriteriaValue: 123 } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body).to.be.deep.equal();
  });
});
