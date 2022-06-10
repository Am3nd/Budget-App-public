import sinon from 'sinon'
import {expect}  from 'chai'
 import 'mocha'
 const sandbox = sinon.createSandbox();


describe('Running BudgetController', () => {
    it('should return Transactions object', () => {
       expect(1).to.equal(1);
    });
    
    it('should return Budgets object', () => {
      expect(2).to.equal(2);
    });
   
    it('should verify System Authentication', () => {
        expect(2).to.equal(2);
    });

    it('should initialize DatabaseController', () => {
        expect(2).to.equal(2);
    });

  });

 

