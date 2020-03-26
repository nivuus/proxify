/*
 * Copyright 2020 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by Maxime Allanic <maxime@allanic.me> at 25/03/2020
 */

const $proxify = require('../');
const $assert = require('assert');

describe('Proxify', () => {
    it('should create proxy of object', () => {
        var o = new $proxify({
            p: 'test'
        });
        $assert.deepEqual({ p: 'test' }, o);
    });

    it('shoud set value to proxy', () => {
        var o = new $proxify({
            p: 'test'
        });
        o.p = 'wait';

        $assert.deepEqual({ p: 'wait' }, o);
    });

    it('should call $onSet on proxy change', () => {
        var o = new $proxify({
            p: 'test'
        });
        var flag = false;
        o.$onSet(function () {
            flag = true;
        });
        o.p = 'wait';

        $assert.equal(flag, true);
    });

    it('should call $onSet on deep proxy change', () => {
        var o = new $proxify({
            p: {
                r: 'test'
            }
        });
        var flag = false;
        o.$onSet(function () {
            flag = true;
        });
        o.p.r = 'wait';

        $assert.equal(flag, true);
    });

    it('should call $onSet on deep proxy change and give key path on parameter', () => {
        var o = new $proxify({
            p: {
                r: 'test'
            }
        });
        var flag = false;
        o.$onSet(function (key) {
            $assert.equal(key, 'p.r');
            flag = true;
        });
        o.p.r = 'wait';

        $assert.equal(flag, true);
    });

    it('should call $onSet when sub object is moved', () => {
        var o = new $proxify({
            p: {
                r: 'test'
            }
        });
        var modified = [];


        o.$onSet(function (key) {
            modified.push(key);
        });

        o.s = o.p;

        o.s.r = 'wait';

        $assert.deepEqual(modified, [
            's',
            'p.r',
            's.r'
        ]);
    });

    it('should work with array', () => {
        var o = new $proxify([
            'a'
        ]);

        var increment = 0;
        o.$onSet((key, value) => {
            increment++;
        });
        o.push('e');
        $assert.equal(increment, 1);
    });
});