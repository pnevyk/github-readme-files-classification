'use strict';

const commonmark = require('commonmark');

// returns array of extracted features which are listed above extract function below
module.exports.extract = function (markdown) {
    return extract(parse(markdown));
};

// returns the list of features which are extracter by this module
module.exports.list = function () {
    return [
        'Name',
        'Document length',
        'Number of sections',
        'Number of code blocks',
        'Code blocks length',
        'Number of links',
        'Number of images',
        'Usage/Examples text length',
        'Usage/Examples code blocks length',
        'Usage/Examples code blocks count',
        'Usage/Examples link presence',
        'Getting started/Documentation/API text length',
        'Getting started/Documentation/API code blocks length',
        'Getting started/Documentation/API link presence',
        'Installation/Download plain and code length',
        'Installation/Download link presence',
        'Support/Community/Resources links',
        'Build status badge presence',
        'Code coverage badge presence',
        'Code quality badge presence',
        'Dependency status badge presence',
        'Deprecation status',
        'License section/link presence',
        'Contributing section/link presence',
        'Authors/Team section/link presence',
        'Troubleshooting section/link presence',
    ];
};

/*
Returns the structure represented as:
Structure {
    name: "name of the section, the most top section has special name [top level]",
    subsections: [Structure, ...], // nested structures
    plainContent: "all the text concatenated without whitespace characters",
    tokens: [], // plain content split by space
    links: [{
        href: "link destination",
        title: "link title",
        linkType: "build status, code coverage, code quality, dependency status,
            support, person, documentation, examples, installation, normal"
    }],
    codeBlocks: [], "list of code block contents"
    images: [{
        src: "image source",
        title: "image title",
        imageType: "animation, static"
    }]
}
 */
function parse(text) {
    let parser = new commonmark.Parser();
    let tree = parser.parse(text);
    let walker = tree.walker();
    let event;
    let level = 0;
    let structure = makeSection('[top level]');
    let current = structure;

    while ((event = walker.next()) != null) {
        if (!event.entering) {
            continue;
        }

        let node = event.node;
        switch (node.type) {
            case 'text':
                current.plainContent += node.literal.replace(/\s+/g, '').toLowerCase();
                current.tokens = current.tokens
                    .concat(node.literal.split(' ')
                        .filter(token => token !== ''));
                break;
            case 'image':
                current.images.push({
                    src: node.destination,
                    title: node.title,
                    imageType: getImageType(node.destination)
                });
                break;
            case 'link':
                current.links.push({
                    href: node.destination,
                    title: node.title,
                    linkType: getLinkType(node.destination, node.title)
                });
                break;
            case 'code_block':
                current.codeBlocks.push(node.literal.replace(/\s+/g, ''));
                break;
            case 'heading':
                level = node.level;
                let sections = structure.subsections;
                let parent = structure;
                for (let i = 1; i < level; i++) {
                    if (sections.length === 0) {
                        break;
                    }
                    parent = sections[sections.length - 1];
                    sections = sections[sections.length - 1].subsections;
                }

                current = makeSection(getText(node));
                sections.push(current);
                break;
            default:
                break;
        }
    }

    return structure;

    function getText(node) {
        let output = '';
        node = node.firstChild;
        while (node != null) {
            if (node.type === 'text') {
                output += ' ' + node.literal;
            } else if (node.type !== 'image') {
                output += getText(node);
            }
            node = node.next;
        }
        return output;
    }

    function getImageType(src) {
        const split = src.split('.');
        const extension = split[split.length - 1].toLowerCase();
        if (extension === 'gif') {
            return 'animation';
        } else {
            return 'static';
        }
    }

    function getLinkType(href, title) {
        const hrefPatterns = [
            ['build status', /travis\-ci\.org\/[^\/]+\/.+/],                // Travis CI
            ['build status', /ci\.appveyor\.com\/project\/.+/],             // Appveyor
            ['build status', /codeship\.io\/projects\/\d+/],                // Codeship
            ['build status', /app\.wercker\.com\/project\/.+/],             // Wercker
            ['build status', /semaphoreapp\.com\/[^\/]+\/.+/],              // Semaphore
            ['code coverage', /coveralls\.com\/r\/[^\/]+\/.+/],             // Coveralls
            ['code coverage', /codecov\.io\/github\/.+/],                   // Codecov
            ['code quality', /codeclimate\-ci\.com\/github\/[^\/]+\/.+/],   // Code climate
            ['code quality', /scrutinizer\-ci\.com\/g\/[^\/]+\/.+/],        // Scrutinizer
            ['dependency status', /gemnasium\.com\/[^\/]+\/.+/],            // Gemnasium
            ['dependency status', /david\-dm\.org\/[^\/]+\/.+/],            // David
            ['dependency status', /versioneye\.com\/user\/projects\/.+/],   // Version Eye
            ['support', /gitter\.im\/.+/],                                  // Gitter
            ['support', /[^\.]+\.slack\.com/],                              // Slack
            ['person', /github\.com\/[^\/]+$/],                             // Github
            ['person', /twitter\.com\/[^\/]+$/]                             // Twitter
        ];

        const hrefTitlePatterns = [
            ['examples', /usage|examples?/],
            ['documentation', /doc(?:s|umentation)|api/],
            ['installation', /install(?:ation|ing)?|download/]
        ];

        for (let i = 0; i < hrefPatterns.length; i++) {
            if (hrefPatterns[i][1].test(href)) {
                return hrefPatterns[i][0];
            }
        }

        title = title.toLowerCase();
        for (let i = 0; i < hrefTitlePatterns.length; i++) {
            if (hrefTitlePatterns[i][1].test(href) || hrefTitlePatterns[i][1].test(title)) {
                return hrefTitlePatterns[i][0];
            }
        }

        return 'normal';
    }
}

/*
Extracted features are:
    1.  document length (number of characters)
    2.  number of sections
    3.  number of code blocks
    4.  total length of code blocks (number of characters)
    5.  number of links
    6.  number of images
    7.  plain content length of usage/examples section (number of characters)
    8.  length of code blocks in usage/examples section (number of characters)
    9.  number of code blocks in usage/examples section (number of blocks)
    10. presence of usage/examples link (0 for absence, 1 for presence)
    11. plain content length of getting started/documentation/api section (number of characters)
    12. length of code blocks in getting started/documentation/api section (number of characters)
    13. presence of getting started/documentation/api link (0 for absence, 1 for presence)
    14. total length (plain + code blocks) of installation/download section (number of characters)
    15. presence of installation/download link (0 for absence, 1 for presence)
    16. links related to support/community/resources (number of links)
    17. presence of build status link/badge (0 for absence, 1 for presence)
    18. presence of code coverage link/badge (0 for absence, 1 for presence)
    19. presence of code quality link/badge (0 for absence, 1 for presence)
    20. presence of dependency status link/badge (0 for absence, 1 for presence)
    21. deprecation status (0 for no info, 0.5 where mention about maintainership,
            1 for deprecated or "looking for maintainer" project)
    22. presence of license section/link (0 for absence, 1 for presence)
    23. presence of contributing section/link (0 for absence, 1 for presence)
    24. presence of authors/team section/link (0 for absence, 1 for presence)
    25. presence of troubleshooting section/link (0 for absence, 1 for presence)
 */
function extract(struct) {
    let usageRe = /usage|examples?/;
    let docsRe = /getting\sstarted|doc(?:s|umentation)|api/;
    let installRe = /install(?:ation|ing)?|download/;
    let supportRe = /support|community|resources/;

    return [
        getSectionContentLength(struct),
        getNumberOfSections(struct),
        getArrayPropertyCount(struct, 'codeBlocks'),
        getArrayPropertyLength(struct, 'codeBlocks'),
        getArrayPropertyCount(struct, 'links'),
        getArrayPropertyCount(struct, 'images'),
        getSectionContentLength(
            getSectionByName(struct, usageRe)),
        getArrayPropertyLength(
            getSectionByName(struct, usageRe), 'codeBlocks'),
        getArrayPropertyCount(
            getSectionByName(struct, usageRe), 'codeBlocks'),
        Number(getLinkPresenceByType(struct, 'examples')),
        getSectionContentLength(
            getSectionByName(struct, docsRe)),
        getArrayPropertyLength(
            getSectionByName(struct, docsRe), 'codeBlocks'),
        Number(getLinkPresenceByType(struct, 'documentation')),
        getSectionContentLength(
            getSectionByName(struct, installRe)) +
                getArrayPropertyLength(
                    getSectionByName(struct, installRe), 'codeBlocks'),
        Number(getLinkPresenceByType(struct, 'installation')),
        getArrayPropertyCount(
            getSectionByName(struct, supportRe), 'links'),
        Number(getLinkPresenceByType(struct, 'build status')),
        Number(getLinkPresenceByType(struct, 'code coverage')),
        Number(getLinkPresenceByType(struct, 'code quality')),
        Number(getLinkPresenceByType(struct, 'dependency status')),
        getDeprecationStatus(struct),
        Number(getSectionOrLinkPresence(struct, /licenses?/)),
        Number(getSectionOrLinkPresence(struct, /contribut(?:ing|e|ion)(?:\sguide)?/)),
        Number(getSectionOrLinkPresence(struct, /authors?|team/)),
        Number(getSectionOrLinkPresence(struct, /troubleshoot(?:ing)?/))
    ];

    function getSectionContentLength(section) {
        return section.plainContent.length + section.subsections
            .reduce((acc, sub) => acc + getSectionContentLength(sub), 0);
    }

    function getNumberOfSections(section) {
        let def = section.name === '[top level]' ? 0 : 1;
        return section.subsections
            .reduce((acc, sub) => acc + getNumberOfSections(sub), def);
    }

    function getArrayPropertyCount(section, property) {
        return section[property].length + section.subsections
            .reduce((acc, sub) => acc + getArrayPropertyCount(sub, property), 0);
    }

    function getArrayPropertyLength(section, property) {
        return section[property].reduce((acc, prop) => acc + prop.length, 0) + section.subsections
            .reduce((acc, sub) => acc + getArrayPropertyLength(sub, property), 0);
    }

    function getSectionByName(section, pattern) {
        if (pattern.test(section.name.toLowerCase())) {
            return section;
        } else {
            for (let i = 0; i < section.subsections.length; i++) {
                let ret = getSectionByName(section.subsections[i], pattern);
                if (ret.name !== '[anonymous]') {
                    return ret;
                }
            }
            return makeSection();
        }
    }

    function getLinkPresenceByType(section, linkType) {
        if (section.links.some(link => link.linkType === linkType)) {
            return true;
        } else {
            return section.subsections.some(sub => getLinkPresenceByType(sub, linkType));
        }
    }

    function getDeprecationStatus(section) {
        let needPattern = /(?:look(?:ing)?|need).{,30}maintain(?:er(?:ship))/;
        let mentionPattern = /maintain(?:er(?:ship))/;
        if (needPattern.test(section.plainContent)) {
            return 1;
        } else if (mentionPattern.test(section.plainContent)) {
            return 0.5;
        } else {
            return section.subsections
                .map(sub => getDeprecationStatus(sub))
                .reduce((acc, status) => status > acc ? status : acc, 0);
        }
    }

    function getSectionOrLinkPresence(section, name) {
        if (name.test(section.name.toLowerCase()) ||
            section.links.some(link => name.test(link.title.toLowerCase()))) {
            return true;
        } else {
            return section.subsections.some(sub => getSectionOrLinkPresence(sub, name));
        }
    }
}

function makeSection(name) {
    if (name === undefined) {
        name = '[anonymous]';
    }

    return {
        name,
        subsections: [],
        plainContent: '',
        tokens: [],
        links: [],
        codeBlocks: [],
        images: []
    };
}
