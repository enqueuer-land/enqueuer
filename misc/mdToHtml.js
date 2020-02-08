#!/usr/bin/env node
/*jshint node:true, es5:true */
const http = require('https');
const url = require('url')
const pagedown = require('pagedown');
const converter = new pagedown.Converter();
const fs = require('fs');
const template = fs.readFileSync(__dirname + "/html/template.html").toString();
const md = fs.readFileSync("docs/README.md").toString();
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
        .replace('mailto%3a', 'mailto:')
        .replace('alt="screenshot-passing"',
            'alt="screenshot-passing" style="width:100%"')
        .replace(/\$/gi, () => '<span class="dollar-sign">$</span>')
});


function fetchPlugins() {
    return new Promise((resolve, reject) => {
        const request = http
            .request(`https://raw.githubusercontent.com/enqueuer-land/plugins-list/master/plugins.json`, (resp) => {
                let data = '';
                resp
                    .on('data', (chunk) => {
                        data += chunk;
                    })
                    .on('end', () => {
                        resolve({data: JSON.parse(data), statusCode: resp.statusCode});
                    });
            }).on("error", (err) => {
                reject(err);
            });
        request.write('');
        request.end();
    });
}

fetchPlugins()
    .then(payload => payload.data)
    .then(plugins => plugins
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((plugin) => {
            const user = getUser(plugin.githubUrl);
            return ` <div class="row no-gutters py-1">
                          <div class="col-3"><a href="${user.url}" target="_blank"><img src="${user.picture}" style="width: 15%" class="img-fluid rounded mx-auto px-2 rounded-circle">${user.name}</a></div>
                          <div class="col-3"><a href="${plugin.githubUrl}" style="overflow: scroll; height: inherit" target="_blank">${plugin.name}</a></div>
                          <div class="col-6" style="color: var(--nqr-text-smooth-color); overflow: scroll; white-space: nowrap; text-overflow: ellipsis">${plugin.description}</div>
                    </div>
                    `;
        })
        .join(''))
    .then(innerHtml => {
        return `
                    <div class="container px-0 pt-2"> <!--style="background-color: var(&#45;&#45;nqr-header-background-color)"-->
                      <div class="row no-gutters pb-1">
                        <div class="col-3"><h5 class="px-1">Author</h5></div>
                        <div class="col-3"><h5 class="px-1">Name</h5></div>
                        <div class="col-6"><h5 class="px-1">Description</h5></div>
                      </div>
                    </div>
                    <div class="container-fluid px-0 pb-1" >
                      ${innerHtml}
                    </div>`;
    })
    .then(createHtml);

function getUser(repo) {
    if (!repo) {
        return null;
    }

    let path = url.parse(repo).path;
    if (path.length && path.charAt(0) === '/') {
        path = path.slice(1);
    }
    path = path.split('/')[0];
    return {picture: `http://github.com/${path}.png`, name: path, url: `http://github.com/${path}`};
}


function createHtml(pluginsListTable) {
    const readMeHtmlized = converter.makeHtml(md).replace('{{plugins list placeholder}}', pluginsListTable);
    spyHtml += `</nav></nav></nav>`;
    const content = spyHtml +
        `<div class="nqr-main-container container" style="max-width: 90%">` +
        readMeHtmlized +
        `</div></div>`;

    const htmlResult = template.replace('<!--README CONTENT PLACEHOLDER-->', content);

    fs.writeFileSync('docs/docs.html', htmlResult);
    console.log("Html generated");
}
