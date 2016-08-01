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

const READMES_DIRECTORY = path.join(__dirname, '..', 'data', 'readmes');

const client = github.client(GITHUB_AUTH_TOKEN);

const ghsearch = client.search();

// page, order
const queries = [
    [1, 'desc'],
    [2, 'desc'],
    [3, 'desc'],
    [10, 'desc'],
    [11, 'desc'],
    [12, 'desc'],
    [21, 'desc'],
    [22, 'desc'],
    [23, 'desc'],
    [1, 'asc'],
    [2, 'asc'],
    [3, 'asc'],
    [5, 'asc'],
    [6, 'asc'],
    [7, 'asc'],
    [10, 'asc'],
    [11, 'asc'],
    [12, 'asc'],
    [15, 'asc'],
    [16, 'asc'],
    [17, 'asc'],
    [20, 'asc'],
    [21, 'asc'],
    [22, 'asc']
].map(params => getGithubQuery(params[0], params[1]));

async.parallel(queries, (err, containers) => {
    let repos = containers.reduce((acc, container) => acc.concat(container), []);
    repos.forEach(repo => {
        client.repo(repo).readme((err, response) => {
            if (err) {
                console.error(`repository ${repo}: downloading readme file failed`);
            } else {
                let ext = path.extname(response.name);
                if (ext != '.md' && ext != '.markdown') {
                    console.error(`repository ${repo}: unsupported format of readme file`);
                } else {
                    let filename = path.join(READMES_DIRECTORY, repo.replace('/', '--')) + '.md';
                    let content = response.content;
                    fs.writeFile(filename, base64.decode(content), err => {
                        if (err) {
                            console.log(`repository ${repo}: writing readme file failed`);
                        } else {
                            console.log(`repository ${repo}: readme successfully downloaded`);
                        }
                    });
                }
            }
        });
    });
});

function getGithubQuery(page, order) {
    return cb => ghsearch.repos({
        q: 'language:javascript',
        sort: 'stars',
        order,
        page
    }, (err, repos) => cb(err, repos.items.map(repo => repo['full_name'])));
}
