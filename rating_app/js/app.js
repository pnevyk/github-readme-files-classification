(function () {
    var RATED_KEY = 'rated';
    var ID_KEY = 'id';
    var CURRENT_KEY = 'current';

    var readmes;
    var contentElement = dom.elem('#content');

    function generateIdentifier() {
        function generatePart(k) {
            return Math.round(Math.random() * k).toString(16);
        }
        return [generatePart(1e9), generatePart(1e6), generatePart(1e3)].join('-');
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getNextReadmeName() {
        rated = storage.get(RATED_KEY).reduce((obj, readme) => {
            obj[readme] = true;
            return obj;
        }, {});

        var index;
        do {
            index = getRandomInt(0, readmes.length);
        } while (rated[readmes[index]]);

        return readmes[index];
    }

    function getList(callback) {
        superagent
            .get('list')
            .end((err, res) => {
                callback(err, res.text.split('\n').map(line => line.split('\t')));
            });
    }

    function getReadme(name, callback) {
        superagent
            .get('readme')
            .query({name: name})
            .end((err, res) => {
                callback(err, res.text);
            });
    }

    function rateReadme(name, rating, callback) {
        superagent
            .post('rate')
            .send({id: storage.get(ID_KEY), name: name, rating: rating})
            .end((err, res) => {
                callback(err, res.text);
            });
    }

    function displayReadme(err, content) {
        if (err) {
            dom.render(contentElement,
                `<h2>Error occured during fetching readme content</h2><span>${JSON.stringify(err)}</span>`);
        } else {
            dom.render(contentElement, content);
        }
    }

    function setTitle() {
        document.title = 'Readme rating: ' + storage.get(CURRENT_KEY).replace('--', '/');
    }

    function handleButtonClick(rating) {
        return e => {
            rateReadme(storage.get(CURRENT_KEY), rating, err => {
                if (err) {
                    dom.render(contentElement,
                        `<h2>Error occured during rating readme</h2><span>${JSON.stringify(err)}</span>`);
                } else {
                    storage.set(CURRENT_KEY, getNextReadmeName());
                    getReadme(storage.get(CURRENT_KEY), displayReadme);
                    setTitle();
                }
            });
        };
    }

    // === INIT ===

    dom.on(dom.elem('#controls button:nth-of-type(1)'), 'click', handleButtonClick(1));
    dom.on(dom.elem('#controls button:nth-of-type(2)'), 'click', handleButtonClick(2));
    dom.on(dom.elem('#controls button:nth-of-type(3)'), 'click', handleButtonClick(3));
    dom.on(dom.elem('#controls button:nth-of-type(4)'), 'click', handleButtonClick(4));
    dom.on(dom.elem('#controls button:nth-of-type(5)'), 'click', handleButtonClick(5));

    dom.on(dom.elem('#clear-storage'), 'click', e => storage.clear());

    getList((err, list) => {
        readmes = list.map(readme => readme[0]);

        var initials = {};
        initials[RATED_KEY] = [];
        initials[ID_KEY] = generateIdentifier();

        storage.init(initials);

        storage.set(CURRENT_KEY, getNextReadmeName());
        setTitle();
        getReadme(storage.get(CURRENT_KEY), displayReadme);
    });
})();
