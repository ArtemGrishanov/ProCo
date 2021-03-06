/**
 * Created by artyom.grishanov on 06.06.16.
 */

var myProjectsView = {};
(function(global){

    /**
     * Вью карточки - шаблоны пользователя
     * @type {{}}
     */
    var userTemplateViews = {};

    function initUIHandlers() {

    }

    function init() {
//        if (config.common.showHelpNotificationInMyProjects_12_2017 === true) {
//            $('#id-helpNotification_12_2017').show();
//            if (window.localStorage.getItem('notif_12_2017_status') != 'applied') {
//                setTimeout(function() {
//                    Modal.showHelpNotificationInMyProjects_12_2017Modal({canClose: false});
//                }, 1333);
//            }
//        }
        initUIHandlers();
        // автоматический запрос сохраненных темплейтов пользователя как только это становится возможным
        Auth.addEventCallback(onAuthEvent);
    }

    function onEditClick(e) {
        var url = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
        // window.location.href = 'editor.html?'+config.common.templateUrlParamName+'='+url;
        App.openEditor({
            templateUrl:url
        });
    }

    function onCloneClick(e) {
        var url = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
        // window.location.href = 'editor.html?'+config.common.templateUrlParamName+'='+url+'&'+config.common.cloneParamName+'=true';
        App.openEditor({
            templateUrl:url,
            clone:true
        });
    }

    /**
     * Операция удаления с подтверждением
     *
     * @param e
     */
    function onDeleteClick(e) {
        if (confirm('Удалить этот проект?') === true) {
            Modal.showLoading();
            var templateId = $(e.currentTarget).parent().parent().attr('data-id');
            App.deleteTemplate(function(result) {
                if (result === 'ok') {
                    // удалить вью из списка
                    $(userTemplateViews[templateId]).remove();
                }
                Modal.hideLoading();
            }, templateId);
        }
    }

    /**
     * Отрисовать список моих проектов
     */
    function render(myTemplates) {
        var $cnt = $('#id-my_projects_cnt');
        // не очищаем контейнер - в нем уже находится кнопка создания нового пустого теста
        for (var i = 0; i < myTemplates.length; i++) {
            var v = renderTemplateThumb(myTemplates[i], $cnt);
            userTemplateViews[myTemplates[i].id] = v;
        }
    }

    /**
     * Отрисовать один элемент в списке моих проектов с ключевыми элементами:
     * картинки, название, атрибуты, ид и так далее
     */
    function renderTemplateThumb(templateData, $cnt) {
        var s = $('#id-my_project_elem_template').html();
        s = s.replace('{{data_file_url}}',templateData.url);
        var $e = $(s);
        App.localize($e);
        $cnt.append($e);
        $e.find('.js-edit').click(onEditClick);
        $e.find('.js_app-clone').click(onCloneClick);
        $e.find('.js-delete_item').click(onDeleteClick);
        $e.attr('data-id',templateData.id);
        return $e;
    }

    /**
     * Так как информация о тесте загружается позже, чем список тестов
     * то для установки информации (картинка, атрибуты, название...) отдельный метод
     */
    function renderTemplateInfo(template) {
        var v = userTemplateViews[template.id];
        if (v) {
            var title = template.title || template.id;
            $(v).find('.js-title').text(title);
            if (template.isValid() === true) {
                // с шаблоном все в порядке, его можно редактировать - показываем кнопки редактирования
                $(v).find('.st_item_img').addClass('__active');
                $(v).find('.js-status').hide();
            }
            else {
                $(v).find('.js-status').text(App.getText('error'));
            }
            if (template.previewUrl) {
                $(v).find('.js-preview').css('backgroundImage','url('+config.common.awsHostName+'/'+config.common.awsBucketName+'/'+template.previewUrl+')');
            }
            // for test template.publishDate = 'Mon Apr 25 2016 12:37:00 GMT+0300 (MSK)';
            if (template.publishDate) {
                var d = new Date(template.publishDate);
                $(v).find('.js-publish').addClass('__published').text(App.getText('published') + ' ' + d.toLocaleDateString());
            }
            if (template.lastModified) {
                var d = new Date(template.lastModified);
                $(v).find('.js-last_modified').text(App.getText('saved') + ' ' + d.toLocaleString());
            }
        }
    }

    /**
     * Показать диалог с выбором своих сохраненных проектов
     *
     * @param params
     */
    function showMyTemplates() {
        if (App.getUserTemplates() === null) {
            App.requestUserTemplates(function(templates) {
                if (templates !== null) {
                    render(templates);
                }
                else {
                    // нет шаблонов
                }
            }, onTemplateGetInfo);
        }
        else {
            // уже есть информация, показываем
            render(App.getUserTemplates());
        }
    }

    function onTemplateGetInfo(template) {
        // здесь приходит уточненная информация о шаблоне
        // нужно найти элемент в dom о обновить его
        renderTemplateInfo(template);
    }

    /**
     * Обработка событий из модуля авторизации
     *
     * @param {string} event
     * @param {object} data
     */
    function onAuthEvent(event, data) {
        switch(event) {
            case Auth.EVENT_SIGNIN_SUCCESS: {
                showMyTemplates();
                break;
            }
        }
    };

    // public
    global.init = init;

})(myProjectsView);
