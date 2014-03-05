'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  // beforeEach(module('myApp.services'));


  // describe('version', function() {
  //   it('should return current version', inject(function(version) {
  //     expect(version).toEqual('0.1');
  //   }));
  // });

    describe('Dummy', function() {
        it('should just works', inject(function() {
            expect(true).toEqual(true);
        }));
    });
});
