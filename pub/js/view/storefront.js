/**
 * Created by artyom.grishanov on 18.04.16.
 */

var storefrontView = {};
(function (global) {

    var activeTemplateUrl = null;
    var activeCategory = null;
    /**
     * Признак того что категория уже отрендерена, не надо заново рендерить в showCategory
     * loadedCategories['test'] = true
     *
     * @type {{}}
     */
    var loadedCategories = {};
    /**
     * Элементы витрины которые показаны в данный момент
     * @type {Array}
     */
    var items = [];

    /**
     * for mob
     * @type {null}
     */
    var activeItemOperationLayer = null;
    /**
     * for mob
     * @type {null}
     */
    var activeMobTemplateUrl = null;

    var bodyScrollTop = 0;

    /**
     * Найти нужный шаблон по его урлу
     * В первой попавшейся категории
     *
     * @param {string} templateUrl
     * @returns {*}
     */
    function findTemplate(templateUrl) {
        for (var catName in config.storefront.categories) {
            var info = config.storefront.categories[catName];
            for (var i = 0; i < info.entities.length; i++) {
                var e = info.entities[i];
                if (e.template === templateUrl) {
                    return e;
                }
            }
        }
        return null;
    }

    /**
     * На основе конфига сформировать и показать категорию проектов в витрине
     * Категория будет показана если она включена (enabled) и там есть элементы
     *
     * @param {string} catId
     */
    function showCategory(catId) {
        activeCategory = catId;
        items = [];
        if (!loadedCategories[activeCategory]) {
            var info = config.storefront.categories[catId];
            if (info && info.enabled === true && info.entities) {
                var $cnt = $('.js-category_storefront[data-category="'+catId+'"]').find('.js-entities_cnt').empty();
                if ($cnt.length > 0) {
                    var templStr = $('#id-storefront_entity_template').html();
                    for (var i = 0; i < info.entities.length; i++) {
                        var e = info.entities[i];
                        var str = templStr.replace('{{name}}', e.name)
                            .replace('{{img}}', e.img)
                            .replace('{{template}}', e.template);
                        if (e.typeLabel) {
                            str = str.replace('{{type}}', e.typeLabel)
                        }
                        var $e = $(str);
                        App.localize($e);
                        $e.find('.js-edit').click(onEditClick);
                        $e.find('.js_app-preview').click(onPreviewClick);
                        if (!e.typeLabel || activeCategory !== config.storefront.allCategoryKey) {
                            $e.find('.js-item_type_label').hide();
                        }
                        $cnt.append($e);
                        if (App.isTouchMobile() === true) {
                            $e.click(onItemClick);
                        }
                        items.push($e);
                    }
                }
            }
            loadedCategories[activeCategory] = true;
        }
        $('.js-category_storefront').hide();
        $('.js-category_storefront[data-category="'+activeCategory+'"]').show();

        // показ страницы с активной категорией
        if (window.ga) {
            window.ga('send', 'pageview', '/storefront_'+activeCategory);
        }
    }

    /**
     * Показать превью проекта по всплывающем леере
     * @param {string} templateUrl ссылка на шаблон, используется как ключ.
     * На самом деле используется ссылка на опубликованный проект из конфига
     * @param {string} force - быстрое открытие без предварительного клика
     */
    function showPreview(templateUrl, force) {
        if (force !== true) {
            if (App.isTouchMobile() === true && activeMobTemplateUrl !== templateUrl) {
                // для моба должны сначала кликнуть на этом шаблоне и показать опции
                return;
            }
        }
        var info = findTemplate(templateUrl);
        if (templateUrl && info) {
            if (info.published && info.width && info.height) {
                activeTemplateUrl = templateUrl;
                //Example: '<div class="testix_project" data-width="800px" data-height="600px" data-published="http://p.testix.me/121947341568004/870dcd0a6b/p_index.html"><script src="//testix.me/js/loader.js" async></script></div>'
                var embedCode = config.common.embedCodeTemplate;
                embedCode = embedCode.replace('{{width}}', info.width)
                    .replace('{{height}}', info.height)
                    .replace('{{published}}', info.published);
                $('#id-app_iframe_cnt').empty().append(embedCode);
                $('.scr_wr').addClass('__shadow');
                $('#id-app_preview').show();
                if (window.ga) {
                    window.ga('send', 'pageview', '/storefront_app_preview');
                }

                if (App.isTouchMobile() === true) {
                    bodyScrollTop = $('body').scrollTop();
                    $('#id-page_content').hide();
                    $('body').scrollTop(0);
                }
            }
            else if (info.externalLink) {
                App.openUrl(info.externalLink);
            }
        }
    }

    /**
     * Запустить превью: встроить опубликованный проект стандартным образом через loader.js
     */
    function onPreviewClick(e) {
        var d = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
        showPreview(d);
        e.preventDefault();
        e.stopPropagation();
    }

    function onEditClick(e) {
        var d = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
        if (App.isTouchMobile() === true && activeMobTemplateUrl !== d) {
            // для моба должны сначала кликнуть на этом шаблоне и показать опции
            return;
        }
        if (d) {
            activeTemplateUrl = d;
            var template = findTemplate(activeTemplateUrl);
            App.openEditor({
                templateUrl:activeTemplateUrl,
                clone:true,
                getParams: (template.getParams) ? template.getParams : null
            });
        }
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * На мобе показ леера операций делается кликом а не ховером, как на вебе
     */
    function onItemClick(e) {
        if (activeItemOperationLayer) {
            activeItemOperationLayer.hide();
        }
        activeItemOperationLayer = $(e.currentTarget).find('.js-item-operations').show();
        activeMobTemplateUrl = $(e.currentTarget).attr('data-template-url');
        e.preventDefault();
        e.stopPropagation();
    }

    function init() {
        $('.js-close').click(function(e) {
            $('#id-app_preview').hide();
            if (App.isTouchMobile() === true) {
                $('#id-page_content').show();
                console.log(bodyScrollTop);
                $('body').scrollTop(bodyScrollTop);
            }
            $('.scr_wr').removeClass('__shadow');
        });
        $('.js-edit_active').click(function(e) {
            if (activeTemplateUrl) {
                App.openEditor({
                    templateUrl:activeTemplateUrl,
                    clone:true
                });
            }
        });
        $('.js-category').click(function(e) {
            $('.js-category').removeClass('__selected');
            var catId = $(e.currentTarget).addClass('__selected').attr('data-category');
            showCategory(catId);
        });

        // init 'all' category
        config.storefront.categories[config.storefront.allCategoryKey].entities = [];
        for (var key in config.storefront.categories) {
            if (config.storefront.categories.hasOwnProperty(key) &&
                key != config.storefront.allCategoryKey &&
                config.storefront.categories[key].enabled === true) {
                var entities = config.storefront.categories[key].entities;
                    if (entities) {
                    for (var i = 0; i < entities.length; i++) {
                        if (config.storefront.categories[key].typeLabel) {
                            entities[i].typeLabel = config.storefront.categories[key].typeLabel;
                        }
                        config.storefront.categories[config.storefront.allCategoryKey].entities.push(entities[i]);
                    }
                }
            }
        }

        var appName = getQueryParams(document.location.search)[config.common.appNameParamName];
        var initialCategory = appName || config.storefront.defaultCategory;
        showCategory(initialCategory);
    }

    init();

    global.init = init;
    global.showPreview = showPreview;
    global.showCategory = showCategory;

})(storefrontView);