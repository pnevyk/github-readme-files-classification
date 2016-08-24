(function(window) {
    var initials = {};

    window.storage = {
        get(key) {
            return JSON.parse(localStorage.getItem(key));
        },
        getRaw(key) {
            return localStorage.getItem(key);
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        push(key, value) {
            var array = this.get(key);
            if (Array.isArray(array)) {
                array.push(value);
                return this.set(key, array);
            } else {
                return false;
            }
        },
        has(key) {
            return localStorage.getItem(key) != null;
        },
        remove(key) {
            localStorage.removeItem(key);
        },
        clear() {
            localStorage.clear();
            this.init(initials);
        },
        init(props) {
            Object.assign(initials, props);

            for (var i = 0, keys = Object.keys(props), len = keys.length; i < len; i++) {
                var key = keys[i];
                if (!this.has(key)) {
                    this.set(key, props[key]);
                }
            }
        }
    };
})(window);
