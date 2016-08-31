/**
 * Created by artyom.grishanov on 23.08.16.
 *
 * Проход по всем appProperty на экранах screenIds
 * Экраны могут пересоздаваться в Engine как объект поэтому работает с ид
 */
var PropertyIterator = function(screenIds) {
    this.screenIds = screenIds;
    this._iterated = [];
    this._queue = [];
    this.parse(this.screenIds);
};

/**
 * Собрать с экранов новые propertiesString
 * @param screenIds
 */
PropertyIterator.prototype.parse = function(screenIds) {
    var screens = [];
    for (var i = 0; i < screenIds.length; i++) {
        screens.push(Engine.getAppScreen(screenIds[i]));
    }
    for (var i = 0; i < screens.length; i++) {
        this._parseScreen(screens[i]);
    }
};

/**
 * Собрать новые propertyString с экрана и сложить в очередь
 * @param s
 * @private
 */
PropertyIterator.prototype._parseScreen = function(s) {
    var dataAppElements = $(s.view).find('[data-app-property]');
    for (var i = 0; i < dataAppElements.length; i++) {
        var e = dataAppElements[i];
        var attr = $(e).attr('data-app-property');
        var keys = attr.split(',');
        for (var j = 0; j < keys.length; j++) {
            var newK = keys[j].trim();
            if (this._iterated.indexOf(newK) < 0 &&
                this._queue.indexOf(newK) < 0) {
                this._queue.push(newK);
            }
        }
    }
}

/**
 * Возвращаются propertyString с экранов по очереди
 *
 * @return {string}
 */
PropertyIterator.prototype.next = function() {
    // забираем новые свойства, они могли появиться в любой момент после изменения значения предыдущих свойств.
    this.parse(this.screenIds);
    var propertyString = this._queue.shift();
    this._iterated.push(propertyString);
    return propertyString;
};

PropertyIterator.prototype.queueLength = function() {
    return this._queue.length;;
};