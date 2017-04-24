/**
 * Created by artyom.grishanov on 29.03.16.
 *
 * Кастомный контрол: кастомная логика для проекта должна быть описана в descriptor.js
 *
 * TODO: требуется унификация интерфейса для таких контролов
 */
function CustomQControl(propertyString, directiveName, $parent, productDOMElement, params) {
//    console.log('CustomQControl CustomQControl CustomQControl CustomQControl CustomQControl CustomQControl');
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this._view = null;

    this.loadDirective(function(response, status, xhr){
        this.$directive.off('click').on('click', this._onDirectiveClick.bind(this));

//        идея вью - установка дополнительного вью в контейнер, в директиву. Фигня конечно.
//        if (this._view) {
//            this.$directive.empty().append(this._view);
//        }
    });

    this._onProductDOMElementClick = function(e) {
        if (this.params.onProductDOMElementClick) {
            this.params.onProductDOMElementClick.call(this, {
                cursorPosition: {
                    left: e.offsetX,
                    top: e.offsetY
                },
                app: Engine.getApp(),
                appScreens: this.getActiveScreens(),
                engine: Engine,
                propertyString: this.propertyString,
                editor: Editor
            });
        }
        e.preventDefault();
        e.stopPropagation();
    };

    this._onDirectiveClick = function(e) {
        if (this.params.onDirectiveClick) {
            this.params.onDirectiveClick.call(this, {
                cursorPosition: {
                    left: e.offsetX,
                    top: e.offsetY
                },
                app: Engine.getApp(),
                appScreens: this.getActiveScreens(),
                engine: Engine,
                propertyString: this.propertyString,
                editor: Editor
            });
        }
        // остановить обработку, чтобы workspace в редакторе не обработал и не сбросил выделение
        e.preventDefault();
        e.stopPropagation();
    };

    //TODO наверное, стандартные события стоит сделать частью AbstractControl
    this._onShow = function() {
        if (this.params.onShow) {
            this.params.onShow.call(this, {app: Engine.getApp()});
        }
    };

    /**
     * Получить активные экраны, которые сейчас видны в редакторе
     * @returns {Array}
     */
    this.getActiveScreens = function() {
        var result = [];
        var ids = Editor.getActiveScreens();
        for (var i = 0; i < ids.length; i++) {
            result.push(Engine.getAppScreen(ids[i]));
        }
        return result;
    };

    this.$productDomElement.off('click').on('click', this._onProductDOMElementClick.bind(this));
//    this.setView = function(v) {
//        this._view = v;
//        if (this.$directive) {
//            this.$directive.empty().append(this._view);
//            this.$directive.off('click').on('click', this._onClick.bind(this));
//        }
//    }
}
CustomQControl.prototype = AbstractControl;