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
    }, function () {
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
        assert.ok(false,'Tasks completed with type: testType3');
        done();
    }, function () {
        // correct
        assert.ok(true,'Cannot complete tasks with type: testType3');
        done();
    });
});

QUnit.test("Queue test 3", function( assert ) {
    var done = assert.async();
    Queue.push({
        run: function() {

            var q1 = Queue.create();
            q1.push({
               run: function () {
                   assert.ok(true,'q1 run');
                   q1.release(this);
               }
            });

            var q2 = Queue.create();
            q2.push({
                run: function () {
                    assert.ok(true,'q2 run');

                    var q3 = Queue.create();
                    q3.push({
                        run: function () {
                            assert.ok(true,'q3 run');
                            q3.release(this);
                            q2.release(this);

                            done();
                        }
                    });

                }
            });

            assert.ok(true,'Queue run');
            Queue.release(this);
        }
    });

});

/**
 * Остановка и очистка длительных зависших тасков
 *
 */
QUnit.test("Queue test 4: stop long tasks", function( assert ) {
    var done = assert.async();
    var timeOtherTaskStart = 0;

    // обработчик по типу таска
    Queue.onComplete('long_task',
        function () {
            //onSuccess
            assert.ok(false, 'long_task onSuccess() - its not OK');
        },
        function () {
            //onFail
            assert.ok(true, 'long_task onFail() - its OK');
        }
    );
    // обработчик по типу таска
    Queue.onComplete('other_task',
        function () {
            //onSuccess
            assert.ok(true, 'other_task onSuccess()');
            assert.ok(2500 < (new Date().getTime() - timeOtherTaskStart), 'other_task time performance is about 2000 ms');
            done();
        },
        function () {
            //onFail
            assert.ok(false, 'other_task onFail()');
        }
    );

    // -----------------------------------------------------------------------------------------------------------------

    // длинный таск который будет отменен
    Queue.push({
        type: 'long_task',
        run: function() {
            setTimeout((function() {
                console.log('long_task 1 performed');
                Queue.release(this);
            }).bind(this), 9999);
        },
        onFail: function() {
            assert.ok(false, 'long_task 1 onFail');
        }
    });
    // длинный таск который будет отменен
    Queue.push({
        type: 'long_task',
        run: function() {
            setTimeout((function() {
                console.log('long_task 2 performed');
                Queue.release(this);
            }).bind(this), 9999);
        },
        onFail: function() {
            assert.ok(false, 'long_task 2 onFail');
        }
    });

    // другой нормальный таск который должен выполниться успешно
    timeOtherTaskStart = new Date().getTime();
    Queue.push({
        type: 'other_task',
        run: function() {
            setTimeout((function() {
                Queue.release(this);
                console.log('other_task performed');
            }).bind(this), 2000);
        },
        onFail: function() {
            assert.ok(false, 'other_task 1 onFail');
        }
    });

    assert.ok(Queue.getTasksCount() === 3);

    setTimeout(function() {

        Queue.clearTasks({
            type: 'long_task'
        });
        assert.ok(Queue.getTasksCount() === 1);

    }, 500);
});