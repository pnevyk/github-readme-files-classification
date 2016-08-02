'use strict';

module.exports.console = {
    read(cb) {
        let text = '';

        process.stdin.on('readable', () => {
            const data = process.stdin.read();
            if (data != null) {
                text += data.toString();
            }
        });

        process.stdin.on('end', () => {
            cb(text);
        });
    },
    write(text) {
        console.dir(text);
    }
};
