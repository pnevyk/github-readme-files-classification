(function (window) {
    window.dom = {
        elem(selector) {
            return document.querySelector(selector);
        },
        on(elem, event, handler) {
            elem.addEventListener(event, handler, false);
        },
        render(elem, html) {
            elem.innerHTML = html;
        }
    };
})(window);
