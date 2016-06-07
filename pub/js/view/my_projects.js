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

    /**
     * Отрисовать список моих проектов
     */
    function render(myTemplates) {
        var $cnt = $('#id-my_projects_cnt').empty();
        for (var i = 0; i < myTemplates.length; i++) {
            var v = renderTemplateThumb(myTemplates[i]);
            $cnt.append(v);
            userTemplateViews[myTemplates[i].id] = v;
        }
    }

    /**
     * Отрисовать один элемент в списке моих проектов с ключевыми элементами:
     * картинки, название, атрибуты, ид и так далее
     */
    function renderTemplateThumb(templateData) {
        var s = $('#id-my_project_elem_template').html();
        s = s.replace('{{data_file_url}}',templateData.key);
        return $(s).attr('data-id',templateData.id);
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
                $(v).find('.js-status').text('Ошибка');
            }
            if (template.preview) {
                $(v).find('.js-preview').css('backgroundImage','url('+template.preview+')');
            }
// for test            template.publishDate = 'Mon Apr 25 2016 12:37:00 GMT+0300 (MSK)';
            if (template.publishDate) {
                var d = new Date(template.publishDate);
                $(v).find('.js-publish').addClass('__published').text('Опубликован ' + d.toLocaleDateString());
            }
            if (template.lastModified) {
                var d = new Date(template.lastModified);
                $(v).find('.js-last_modified').text('Сохранено: ' + d.toLocaleString());
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

    // публичные свойства
    //

    // авто инициализация
    initUIHandlers();
    App.on(USER_DATA_RECEIVED, function() {
        // автоматический запрос сохраненных темплейтов пользователя как только это становится возможным
        showMyTemplates();
    });

})(myProjectsView);
