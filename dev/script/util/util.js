(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser global
        factory();
    }
}(this, function() {

    var Util = function() {

    };

    ////////////
    // Object //
    ////////////

    Util.merge = function() {
        var obj = {},
            i = 0,
            il = arguments.length,
            key;

        for (; i < il; ++i) {
            for (key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    obj[key] = arguments[i][key];
                }
            }
        }

        return obj;
    };


    /////////
    // Dom //
    /////////

    Util.parseDom = function(str) {
        var div = document.createElement('div');
        div.innerHTML = str;

        return div.children[0];
    };

    Util.closest = function(el, selector) {
        var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

        while (el) {
            if (matchesSelector.call(el, selector)) {
                return el;
            } else {
                el = el.parentElement;
            }
        }
        return null;
    };

    Util.inViewWhole = function(el) {
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;

        var isVisible = ((elemTop >= 0) && (elemTop < window.innerHeight)) ||
            ((elemBottom > 0) && (elemBottom <= window.innerHeight));

        return isVisible;
    };

    Util.inViewPartial = function(el) {
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;

        var isVisible = !(elemTop < 0 && elemBottom < 0) && (elemTop < window.innerHeight);

        return isVisible;
    };


    ////////////
    // String //
    ////////////

    Util.strToJson = function(str) {
        return JSON.parse(str);
    };

    Util.substringByWord = function(str, length){
        if(str.length > length){
            str = str.substring(0, str.lastIndexOf(' ', length));
        }

        return str;
    };


    ///////////
    // Array //
    ///////////

    Util.indexOf = function(el, collection) {
        return [].indexOf.call(collection, el);
    };

    Util.sortObjArrByKey = function(arr, key) {
        return arr.sort(function(a, b) {
            var x = a[key];
            var y = b[key];

            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };


    ///////////
    // Event //
    ///////////

    Util.triggerEvent = function(el, eventName, data) {
        var event;

        data = data || {};

        if (window.CustomEvent) {
            event = new CustomEvent(eventName, {
                detail: data
            });
        } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(eventName, true, true, data);
        }

        el.dispatchEvent(event);
    };






    window.Util = Util;

    return Util;
}));
