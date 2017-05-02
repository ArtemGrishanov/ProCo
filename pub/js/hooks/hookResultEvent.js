/**
 * Created by artyom.grishanov on 28.04.17.
 */

function HookResultEvent(param) {
    param = param || {};
    /**
     * completed || error || not_exist
     * @type {string}
     */
    this.status = 'none';
    if (param.hasOwnProperty('status') === true) {
        this.status = param.status;
    }
}