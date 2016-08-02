'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const github = require('octonode');
const async = require('async');
const base64 = require('js-base64').Base64;

const GITHUB_AUTH_TOKEN = fs
    .readFileSync(path.join(__dirname, '..', 'GITHUB_AUTH_TOKEN'))
    .toString().slice(0, -os.EOL.length);

const READMES_DIRECTORY = path.join(__dirname, '..', 'data', 'sample');

const client = github.client(GITHUB_AUTH_TOKEN);

const ghsearch = client.search();

module.exports.sample = function (size, done) {
    // split into halves
    let top = Math.ceil(size / 2);
    let bottom = Math.floor(size / 2);

    let readmes = new Map();

    async.series([
        next => {
            let page = 1;
            async.whilst(
                () => readmes.size < top,
                cb => {
                    getReadmes(page, 'desc', readmes, cb);
                    page++;
                },
                err => {
                    if (err) {
                        next(err);
                    } else {
                        let array = Array.from(readmes.entries());
                        array = array.slice(0, top);
                        readmes = new Map(array);
                        next(null);
                    }
                }
            );
        },
        next => {
            let page = 1;
            async.whilst(
                () => readmes.size < size,
                cb => {
                    getReadmes(page, 'asc', readmes, cb);
                    page++;
                },
                err => {
                    if (err) {
                        next(err);
                    } else {
                        let array = Array.from(readmes.entries());
                        array = array.slice(0, size);
                        next(null, array);
                    }
                }
            );
        }
    ], (err, result) => {
        if (err) {
            done(err);
        } else {
            done(null, result[1]);
        }
    });

    function getReadmes(page, order, readmes, cb) {
        ghsearch.repos({
            q: 'language:javascript',
            sort: 'stars',
            page,
            order
        }, (err, result) => {
            if (err) {
                cb(err);
            } else {
                result.items.map(repo => repo['full_name']).forEach(repo => {
                    client.repo(repo).readme((err, response) => {
                        if (!err) {
                            let ext = path.extname(response.name);
                            if (ext == '.md' || ext == '.markdown') {
                                let content = base64.decode(response.content);
                                readmes.set(repo, content);
                            }
                        }
                    });
                });
                cb(null);
            }
        });
    }
};

module.exports.classified = function (repos, labels, done) {
    async.parallel(repos.map(repo => cb => {
        client.repo(repo).readme((err, response) => {
            if (err) {
                cb(null, err);
            } else {
                let ext = path.extname(response.name);
                if (ext == '.md' || ext == '.markdown') {
                    let content = base64.decode(response.content);
                    cb(null, content);
                } else {
                    cb(null, {
                        err: 'only markdown readmes are supported'
                    });
                }
            }
        });
    }), (err, readmes) => {
        let result = [];
        for (let i = 0; i < repos.length; i++) {
            result.push([repos[i], readmes[i], labels[i]]);
        }

        done(null, result);
    });
};
