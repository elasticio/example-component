/* eslint-disable no-prototype-builtins */
import { expect, use } from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';
import { getContext } from '../common';
import Client from '../../src/Client';
import { processAction, getMetaModel } from '../../src/actions/lookupObjects';

use(chaiPromised);

const fakeResponse: any = { data: [1, 2, 3, 4, 5, 6, 7, 8, 9] };

describe('lookupObjects action', () => {
  describe('getMetaModel', () => {
    it('emitAll', async () => {
      const cfg = { objectType: 'users', emitBehavior: 'emitAll' };
      const result = await getMetaModel(cfg);
      expect(result.in.properties.hasOwnProperty('sTerm_1')).to.be.equal(false);
      expect(result.in.properties.hasOwnProperty('pageSize')).to.be.equal(false);
      expect(result.in.properties.hasOwnProperty('pageNumber')).to.be.equal(false);
    });
    it('emitIndividually', async () => {
      const cfg = { objectType: 'users', emitBehavior: 'emitIndividually', termNumber: 1 };
      const result = await getMetaModel(cfg);
      expect(result.in.properties.hasOwnProperty('sTerm_1')).to.be.equal(true);
      expect(result.in.properties.hasOwnProperty('sTerm_2')).to.be.equal(false);
      expect(result.in.properties.hasOwnProperty('link_1_2')).to.be.equal(false);
      expect(result.in.properties.hasOwnProperty('pageSize')).to.be.equal(false);
      expect(result.in.properties.hasOwnProperty('pageNumber')).to.be.equal(false);
    });
    it('emitPage', async () => {
      const cfg = { objectType: 'users', emitBehavior: 'emitPage', termNumber: 2 };
      const result = await getMetaModel(cfg);
      expect(result.in.properties.hasOwnProperty('sTerm_1')).to.be.equal(true);
      expect(result.in.properties.hasOwnProperty('sTerm_2')).to.be.equal(true);
      expect(result.in.properties.hasOwnProperty('link_1_2')).to.be.equal(true);
      expect(result.in.properties.hasOwnProperty('pageSize')).to.be.equal(true);
      expect(result.in.properties.hasOwnProperty('pageNumber')).to.be.equal(true);
    });
  });
  let execRequest;
  describe('success', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should lookup object, emitAll', async () => {
      const cfg = {
        objectType: 'users',
        emitBehavior: 'emitAll'
      };
      const msg = { body: { searchCriteria: ['userAge>25', 'userName=Alex'] } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body.results).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}`
      });
    });
    it('should lookup object, emitIndividually', async () => {
      const cfg = {
        objectType: 'users',
        emitBehavior: 'emitIndividually',
        termNumber: 2
      };
      const msg = {
        body: {
          sTerm_1: {
            fieldName: 'creditLimit',
            condition: 'eq',
            fieldValue: 1
          },
          sTerm_2: {
            fieldName: 'city',
            condition: 'contains',
            fieldValue: 'Kyiv'
          },
          link_1_2: 'and'
        },
      };
      const context = getContext();
      await processAction.call(context, msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.callCount).to.be.equal(fakeResponse.data.length);
      expect(context.emit.getCall(0).args[1].body).to.be.equal(1); // first emit
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}?creditLimit eq 1 and city contains Kyiv`
      });
    });
    describe('should lookup object, emitPage', () => {
      it('should lookup object, emitPage', async () => {
        const cfg = {
          objectType: 'users',
          emitBehavior: 'emitPage',
          termNumber: 1
        };
        const msg = {
          body: {
            sTerm_1: {
              fieldName: 'name',
              condition: 'eq',
              fieldValue: 'Demo'
            },
            pageSize: 2,
            pageNumber: 3
          }
        };
        const context = getContext();
        await processAction.call(context, msg, cfg);
        expect(execRequest.callCount).to.be.equal(1);
        expect(context.emit.callCount).to.be.equal(msg.body.pageNumber);
        expect(context.emit.getCall(0).args[1].body).to.be.deep.equal([1, 2]); // first emit
        expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
          method: 'GET',
          url: `/${cfg.objectType}?name eq Demo`
        });
      });
      it('should lookup object, emitPage', async () => {
        const cfg = {
          objectType: 'users',
          emitBehavior: 'emitPage'
        };
        const msg = {
          body: {
            pageSize: 20,
            pageNumber: 3
          }
        };
        const context = getContext();
        await processAction.call(context, msg, cfg);
        expect(execRequest.callCount).to.be.equal(1);
        expect(context.emit.callCount).to.be.equal(1);
        expect(context.emit.getCall(0).args[1].body).to.be.deep.equal(fakeResponse.data); // first emit
        expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
          method: 'GET',
          url: `/${cfg.objectType}`
        });
      });
      it('should lookup object, emitPage (emit objects count only)', async () => {
        const cfg = {
          objectType: 'users',
          emitBehavior: 'emitPage'
        };
        const msg = {
          body: {
            pageSize: 0,
            pageNumber: 3
          }
        };
        const context = getContext();
        const { body } = await processAction.call(context, msg, cfg);
        expect(execRequest.callCount).to.be.equal(1);
        expect(body).to.be.deep.equal({ totalCountOfMatchingResults: fakeResponse.data.length });
        expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
          method: 'GET',
          url: `/${cfg.objectType}`
        });
      });
    });
  });
});
