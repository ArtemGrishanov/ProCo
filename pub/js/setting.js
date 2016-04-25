/**
 * Created by alex on 27.10.15.
 *
 * Settings - коллекция классов настроек.
 * У класса настройки есть общий UI, реализованный и стилизованный единожды.
 * Потом с помощью этого стандартного UI в экземпляр класса Setting передаются изменения о настройках и далее в компоненты.
 * Например, многие настройки используют ползунок-переключатель: "перемешивать ли вопросы", "показывать ли заголовок".
 * Этот ползунок (один и тот же UI) встретится во многих продуктах и комонентах.
 * Некоторые настройки используют сложный UI, например: выбор цвета или загрузки картинки.
 * Каждый компонент "решает" сам, какие из настроек ему нужны.
 */

var DEFAULT_VALUES = {
    fontFamily: ['Arial','Times New Roman','Verdana'],
    backgroundColor: ['yellow', 'red', 'black']
};

var UI = {
    css: {
        backgroundColor: 'ColorPicker',
        color: 'ColorPicker',
        fontFamily: 'ComboBox'
    },
    text: 'TextInput',
    link: 'LinkInput',
    visible: 'YesNo',
    attr: {
        src: 'UrlInput',
        href: 'LinkInput'
    }
};

/**
 * Создать контроллер и UI для редактирования одного entity
 * У одного entity может быть несколько настроек одновременно
 *
 * @param entity
 */
function Setting(entity, propertyName) {

    this.entity = entity;
    /**
     * Свойство за редактирование которого отвечает этот объект Setting
     * @type {*}
     */
    this.propertyName = propertyName;
    this.isError = false;
    /**
     *
     *
     */
    this.uiName = null,
    /**
     * Jquery-объект, визуальное представление объекта настройки
     * @type {null}
     */
    this.view = null;
    /**
     *
     * @type {null}
     */
    this.value = null;

    this.createUI = function(property, subProperty) {
        var uiName = null;
        if (subProperty) {
            this.uiName = UI[property][subProperty];
            if (this.uiName === undefined) {
                this.isError = true;
                console.error('UI for setting ' + property + '.' + subProperty + ' not exist');
            }
        }
        else {
            this.uiName = UI[property];
            if (this.uiName === undefined) {
                this.isError = true;
                console.error('UI for setting ' + property + ' not exist');
            }
        }
        if (this.uiName !== undefined) {
            var self = this;
            // создаем и загружаем в объект вью компонент дя редактирования настройки
            this.view = $('<div></div>').appendTo('#id-setting_content');
            this.view.load('../../settings/' + this.uiName + '.html', null, function(responseText, textStatus) {
                if (textStatus === 'error') {
                    self.isError = true;
                    console.error('Setting component ' + this.uiName + ' not found');
                }
                else {
                    // передать все данные из entity в UI настройки
                    var $label = self.view.find('.js-setting-label');
                    $label.text(self.entity.id + '.' + self.propertyName);
                    self.value = self.view.find('.js-setting-value');
                    self.value.val(self.entity[propertyName].value);
                }
            });
        }
    };

    var subProperty = undefined;
    if (propertyName == 'css') {
        //TODO для css пока вот такая заточка
        subProperty = entity.css.value.split(':')[0];
    }
    if (subProperty !== undefined) {
        this.createUI(propertyName, subProperty);
    }
    else {
        this.createUI(propertyName);
    }

    /**
     * Готовит обновление-объект
     * Потом эта информация будет применена движком к нужному entity
     * Здесь сразу мы не применяем обновление, движок сам решит когда.
     * В движке есть метод apply, в котором сосредоточена логика обновления
     */
    this.getUpdateFromView = function() {
        var v = null;
        //TODO получение value из каждого UI надо делать в контроллере у UI (создать такую сущность)
        //TODO по разному работает логика преобразований значений для каждого UI
        if (this.uiName == 'YesNo') {
            v = $(this.view).find("input[value='yes']").prop("checked");
        }
        else {
            v = this.value.val();
        }

        if (this.entity[this.propertyName].value == v) {
            return null;
        }
        var r = {};
        r[this.propertyName] = {
            value: v
        };
        return r;
    }
};

//
//// использует ui по типу "да-нет", ползунок
//var s1 = new Settings.YesNo({
//    label:'Перемешивать ли вопросы',
//    default: true,
//    onChange: callback
//});

/**
 * ColorPicker работает с настройкой форматом backgroundColor:#123456;
 *
 *
 */
//var s2 = new Settings.ColorPicker({
//    label: 'Выберите цвет фона',
//    defaultValueIndex: 1,
//    values: ['#345678','#ffeea2','#eeff55'],
//    onChange: callback
//});
//var s3 = new Settings.ComboBox({
//    label: 'Шрифт из списка',
//    defaultValueIndex: 0,
//    values: ['Arial','Verdana','Helvetica','Times New Roman'],
//    onChange: callback
//});
//var s4 = new Settings.TextInput({
//    label: 'Текст кнопки',
//    onChange: callback
//});