#!/usr/bin/env node
/*jshint node:true, es5:true */
const pagedown = require('pagedown');
const converter = new pagedown.Converter();
const fs = require('fs');
const topPart = fs.readFileSync(__dirname + "/html/top.html").toString();
const bottomPart = fs.readFileSync(__dirname + "/html/bottom.html").toString();
const md = fs.readFileSync("README.md").toString();
let spyHtml = `<nav id="navbar-nqr" class="navbar navbar-fixed-left">    
    <a class="" href="#">
            <img class="ml-3 navbar-logo"
                 src="https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo3.png"
                 alt="enqueuer logo"
                 title="Enqueuer Logo">        
    </a>`;

// Configure section and toc generation
converter.hooks.set("postConversion", (text) => {
    const levelCounter = {};
    let previousLevelNumber = null;
    return text
        .replace(/<(h(\d))>/g, (match, header, levelNumber, offset, str) => {
            let levelPrefix = "";

            levelCounter[header] = levelCounter[header] || 0;

            // reset lower levelCounter
            for (let i = Number(levelNumber) + 1; levelCounter["h" + i]; i++) {
                levelCounter["h" + i] = 0;
            }

            // grab higher levelCounter
            for (let i = Number(levelNumber) - 1; levelCounter["h" + i]; i--) {
                levelPrefix = levelCounter["h" + i] + "." + levelPrefix;
            }

            levelCounter[header] = levelCounter[header] + 1;
            levelPrefix = levelPrefix + levelCounter[header];

            const title = str.slice(offset + 4, str.slice(offset).indexOf("</h") + offset);
            const id = title.replace(/ +/g, '_').toLowerCase();
            if (levelNumber <= 4) {
                let difference = levelNumber - previousLevelNumber;
                if (difference > 0) {
                    spyHtml += `<nav class="nav nav-pills flex-column">`;
                } else if (difference < 0) {
                    difference = Math.abs(difference);
                    while (Math.abs(difference) > 0) {
                        spyHtml += `</nav>`;
                        --difference;
                    }
                }
                const navLinkStyle = levelNumber == 4 ? `font-size: 0.95rem;` : '';
                const navLinkClass = 'nav-link ' + (levelNumber == 4 ? 'nav-link-sub-item' : '');
                spyHtml += `<a class="${navLinkClass}" href="#${id}" style="${navLinkStyle}">${levelPrefix.replace(/\d+\.*/g, '&nbsp;&nbsp;&nbsp;') + levelPrefix + '. ' + title}</a>`;
                previousLevelNumber = levelNumber;
            }
            return "<h" + levelNumber + ' id="' + id + '" style="padding-left: ' + 8 * (levelNumber - 3) + 'px">' + levelPrefix + ' ';
        })
        .replace(/\\/g, '<br>')
        .replace(/<code>/g, '<code class="yaml">')
        .replace(/~~(.*)~~/g, (match, p1) => '<span style="text-decoration: line-through">' + p1 + '</span>')
        .replace(/fullLogo1/g, 'fullLogo3')
        // .replace(/ (enqueuer)/gi, (match, p1) => '<span class="enqueuer-name"> ' + p1 + '</span>')
        .replace(/\$/gi, () => '<span class="dollar-sign">$</span>')
});


const readMeHtmlized = converter.makeHtml(md);

spyHtml += `</nav></nav></nav>`;
// Bootstrap-fy
const htmlResult =
    topPart +
    spyHtml +
    `<div class="nqr-main-container container" style="max-width: 90%">` +
    readMeHtmlized +
    `</div></div>` +
    bottomPart;

fs.writeFileSync('docs/index.html', htmlResult);
console.log("Html generated");
