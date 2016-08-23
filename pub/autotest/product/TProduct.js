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
        var appIframe = null;
        var iterator = null;
        // дополнительно:
        // надо запоминать все ранее установленные значения в ходе сценария, чтобы они не пропали
        var savedValues = {};

        //TODO проверить что какие-то appProperty вообще не пояаились на экранах
        //это тоже может быть ошибкой

        Editor.start({
            app: appName,
            //template: '' // другой режим запуска возможен, через шаблон
            callback: function() {
                log('happyPathApp: Editor started');
                assert.ok(true, 'Editor started');
                doScenarion();
            }
        });

//        Queue.push({
//            run: function() {
//                // запуск редактора
//                // в нормальном режиме эти параметры передаются через url-get строку
//                Editor.start({
//                    app: appName,
//                    //template: '' // другой режим запуска возможен, через шаблон
//                    callback: function() {
//                        log('happyPathApp: Editor started');
//                        assert.ok(true, 'Editor started');
//                    }
//                });
//            }
//            //,maxWaitTime:99999999
//        });

        function doScenarion() {
            Queue.push({run: function() {
                appIframe = Editor.getAppIframe();
                assert.ok(appIframe !== null, 'appIframe from Editor');
                TApp.checkApp(assert, appIframe);
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

    //        var sIds = Engine.getAppScreenIds();
    //        for (var i = 0; i < sIds.length; i++) {
                Queue.push({
                    data: {
    //                    screenId: sIds[i]
                    },
                    run: function() {
                        // показать все экраны по очереди
    //                    Editor.showScreen([this.data.screenId]);
                        Editor.showScreen([Engine.getAppScreenIds()[0]]);

                        // создаем итератор для перехода по свойствам экрана
                        iterator = new PropertyIterator(Editor.getActiveScreens());
                        assert.ok(iterator.queueLength()>10,'There are some properties in iterator');

                        // проверить активный экран:
                        // что с нем есть вью экрана приложения
                        // что есть валидные атрибуты data-app-property
                        // и т.д.
                        TEditor.checkActiveScreen(assert, Editor.getActiveScreens()[0]);

                        // проход по всем свойствам, собранным с экрана
                        var p = null;
                        while (p = iterator.next()) {
                            var ap = Engine.getAppProperty(p);
                            TEngine.checkAppProperty(assert, ap);

                            // найти информацию о контроле в редакторе
                            var ci = Editor.findControlInfo(p);
                            assert.ok(ci && ci.control, 'happyPathApp: Finded info about control for \''+p+'\'');

                            // генерируем новое значение и устанавливаем через контрол
                            var newValue = TEditor.changeControlValue(ap, ci.control);

                            if (newValue!==undefined) {
                                // запоминаем сгенерированные новые значения на будущее
                                savedValues[p] = newValue;

                                // еще раз проверка после установки с expectedValue
                                TEngine.checkAppProperty(assert, ap, newValue);

                                // проверить что во вью оно реально установлено.
                                // вью: MutApp.Screens в iframe продукта, Slide превью, превью активного экрана в workspace id-product_screens_cnt
                                // контрол должен вернуть getControlValue()
                            }
                            else {
                                assert.ok(false, 'happyPathApp: Cannot change value for \''+p+'\' with control \''+ ap.controls[0].name+'\'');
                            }
                        }

                        // проверить переключение и отображение экрана
                        // TEditor.checkSlides(assert);

                        //TODO решил не выделить элементы, а просто менять значения контролов
                        // выделение всех элементов приводит к созданию и фильтрации контролов
    //                    Editor.selectElementsOnScreen(function(elem) {
    //                        TEditor.checkControls(assert);
    //                        // контролы управляют настройками верно
    //                        TEditor.changeValue(assert); // ???
    //                    });
                        Queue.release(this);
                    }
                });
    //        }

            Queue.push({run: function() {
                TEngine.checkEngine(assert);
                Queue.release(this);
            }});

            //TODO проверить значения измененные во время сценария
            //savedValues

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
        } //doScenario function
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
