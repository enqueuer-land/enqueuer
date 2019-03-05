#!/usr/bin/env node
/*jshint node:true, es5:true */
const argv = {};
let pagedown = require('pagedown'),
    converter = new pagedown.Converter(),
    fs = require('fs'),
    top_part = fs.readFileSync(__dirname + "/parts/top.html").toString(),
    bottom_part = fs.readFileSync(__dirname + "/parts/bottom.html").toString(),
    levels, toc, nextId;

// Configure section and toc generation
converter.hooks.set("postConversion", (text) => {
    return text.replace(/<(h(\d))>/g, (match, p1, p2, offset, str) => {
        let i, levelStr = "";

        levels[p1] = levels[p1] || 0;

        // Figure out section number
        if (!argv.n) {
            // reset lower levels
            for (i = Number(p2) + 1; levels["h" + i]; i++) {
                levels["h" + i] = 0;
            }

            // grab higher levels
            for (i = Number(p2) - 1; levels["h" + i]; i--) {
                levelStr = levels["h" + i] + "." + levelStr;
            }

            levels[p1] = levels[p1] + 1;
            levelStr = levelStr + levels[p1] + ". ";
        }
        ++nextId;

        const title =  str.slice(offset+4, str.slice(offset).indexOf("</h")+offset);
        return "<h" + p2 + ' id="' + title.replace(/ +/g, '_').toLowerCase() + '">' + levelStr;
    })
    .replace(/\\/g, '<br>')
    .replace(/~~(.*)~~/g, (match, p1) => '<span style="text-decoration: line-through">' + p1 + '</span>')
    .replace(/fullLogo1/g, 'fullLogo3')
    .replace(/ enqueuer/gi, '<span class="enqueuer-name"> enqueuer</span>')
});


const md_path = "README.md";
   let md, output, spyHtml = "";

// Read markdown in
md = fs.readFileSync(md_path).toString();


levels = {};
nextId = 0;
toc = [];
output = converter.makeHtml(md);

spyHtml += '';

// Bootstrap-fy
output =
    top_part +
    spyHtml +
    output +
    bottom_part;

fs.writeFileSync('docs/index.html', output);
console.log("Html generated");
