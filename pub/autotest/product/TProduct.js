/**
 * Created by artyom.grishanov on 13.08.16.
 */

var TScenarios = {};

(function(global){

    function happyTest(assert, appName) {
        var done = assert.async();
        var app = null;

        Queue.push({
            run: function() {
                // запуск редактора
                // в нормальном режиме эти параметры передаются через url-get строку
                Editor.start({
                    app: appName,
                    //template: '' // другой режим запуска возможен, через шаблон
                    callback: function() {
                        Queue.release(this);

                        assert.ok(true, 'Editor started');
                        done();
                    }
                });
            }
        });
    }

    /**
     * Успешный сценарием с открытием приложения
     *
     * @param assert
     * @param appName
     */
    function happyPathApp(assert, appName) {
        appName = appName || 'test';

        var done = assert.async();
        var app = null;

        Queue.push({
            run: function() {
                // запуск редактора
                // в нормальном режиме эти параметры передаются через url-get строку
                Editor.start({
                    app: appName,
                    //template: '' // другой режим запуска возможен, через шаблон
                    callback: function() {
                        assert.ok(true, 'Editor started');
                        Queue.release(this);
                    }
                });
            }
        });

        Queue.push({run: function() {
            app = Engine.getApp();
            TApp.checkApp(assert, app);
            Queue.release(this);
        }});

        Queue.push({run: function() {
            // шаблон загрузился и формально исправен
            // В движке все хорошо создалось
            // апп проперти двух типов
            // количество их примерно верное
            // количество экранов примерно верное
            TEngine.checkEngine(assert);
            Queue.release(this);
        }});

        Queue.push({run: function() {
            // отобразился в редакторе корректно
            // в контейнере появился айфрейм
            TEditor.checkApp(assert);
            // появились слайды соответствующие количеству экранов
            TEditor.checkSlides(assert);
            // контролы все создались
            TEditor.checkControls(assert);
            Queue.release(this);
        }});

        var sIds = Engine.getAppScreenIds();
        for (var i = 0; i < sIds.length; i++) {
            Queue.push({
                data: {
                    screenId: sIds[i]
                },
                run: function() {
                    // показать все экраны по очереди
                    Editor.showScreen([this.data.screenId]);

                    // проверить переключение и отображение экрана
                    TEditor.checkSlides(assert);

                    // выделение всех элементов приводит к созданию и фильтрации контролов
                    Editor.selectElementsOnScreen(function(elem) {
                        TEditor.checkControls(assert);
                        // контролы управляют настройками верно
                        TEditor.changeValue(assert); // ???
                    });
                    Queue.release(this);
                }
            });
        }

        Queue.push({run: function() {
            // после редактирования проекта в режиме превью он отображается верно
            TEditor.checkPreview(assert);

            // изменения в шаблоне можно сохранить
            TEditor.checkSavingTemplate(assert/*, template*/);

            // после публикации все отображается верно
            TEditor.checkPublish(assert);

            Queue.release(this);

            // конец всего сценария
            done();
        }});
    }

    /**
     * Успешный сценарий с открытием шаблона
     *
     * @param assert
     * @param template
     */
    function happyPathTemplate(assert, template) {

        if (!!template === false) {
            assert.ok(false, 'Template is not specified');
        }

        // запуск редактора
        // в нормальном режиме эти параметры передаются через url-get строку
        Editor.start({
            //app: appName,
            template: template
        });

        //TODO
        //...
    }

    global.happyTest = happyTest;
    global.happyPathApp = happyPathApp;
    global.happyPathTemplate = happyPathTemplate;

})(TScenarios);
