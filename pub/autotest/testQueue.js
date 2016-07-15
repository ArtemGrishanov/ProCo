/**
 * Created by artyom.grishanov on 25.12.15.
 */


/**
 *
 */
QUnit.test("Queue test 1", function( assert ) {
    var done = assert.async();
    Queue.push({
        type: 'testType1',
        data: '123',
        run: function() {
            Queue.release(this);
        }
    });
    Queue.push({
        type: 'testType1',
        data: '456',
        run: function() {
            Queue.release(this);
        }
    });
    Queue.onComplete('testType1', function(){
        // correct
        assert.ok(true,'Tasks comleted with type: testType1');
        done();
    }, 500, function () {
        // not correct
        assert.ok(false,'Cannot complete tasks with type: testType1');
        done();
    });
});


/**
 * Невыполненные задачи
 */
QUnit.test("Queue test 2", function( assert ) {
    assert.expect(2);
    var done = assert.async(2);
    Queue.push({
        type: 'testType2',
        maxWaitTime: 500,
        run: function() {
            // never finish
        },
        onFail: function() {
            assert.ok(true,'Failed task');
            done();
        }
    });
    Queue.push({
        type: 'testType3',
        run: function() {
            // Queue.release(this);
            // never release
        }
    });
    Queue.onComplete('testType3', function(){
        // not correct
        assert.ok(false,'Tasks comleted with type: testType3');
        done();
    }, 1000, function () {
        // correct
        assert.ok(true,'Cannot complete tasks with type: testType3');
        done();
    });
});