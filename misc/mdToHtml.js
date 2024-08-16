#!/usr/bin/env node
/*jshint node:true, es5:true */
const http = require('https');
const url = require('url');
const pagedown = require('pagedown');
const converter = new pagedown.Converter();
const fs = require('fs');
const template = fs.readFileSync(__dirname + '/html/template.html').toString();
const md = fs.readFileSync('docs/README.md').toString();
let spyHtml = `<nav id="navbar-nqr" class="navbar navbar-fixed-left">    
    <a class="" href="#">
            <img class="ml-3 navbar-logo"
                 src="https://raw.githubusercontent.com/enqueuer-land/enqueuer/master/docs/images/fullLogo3.png"
                 alt="enqueuer logo"
                 title="Enqueuer Logo">        
    </a>`;

// Configure section and toc generation
converter.hooks.set('postConversion', text => {
  const levelCounter = {};
  let previousLevelNumber = null;
  return text
    .replace(/<(h(\d))>/g, (match, header, levelNumber, offset, str) => {
      let levelPrefix = '';

      levelCounter[header] = levelCounter[header] || 0;

      // reset lower levelCounter
      for (let i = Number(levelNumber) + 1; levelCounter['h' + i]; i++) {
        levelCounter['h' + i] = 0;
      }

      // grab higher levelCounter
      for (let i = Number(levelNumber) - 1; levelCounter['h' + i]; i--) {
        levelPrefix = levelCounter['h' + i] + '.' + levelPrefix;
      }

      levelCounter[header] = levelCounter[header] + 1;
      levelPrefix = levelPrefix + levelCounter[header];

      const title = str.slice(offset + 4, str.slice(offset).indexOf('</h') + offset);
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
      return (
        '<h' +
        levelNumber +
        ' id="' +
        id +
        '" style="padding-left: ' +
        8 * (levelNumber - 3) +
        'px">' +
        levelPrefix +
        ' '
      );
    })
    .replace(/\\/g, '<br>')
    .replace(/<code>/g, '<code class="yaml">')
    .replace(/~~(.*)~~/g, (match, p1) => '<span style="text-decoration: line-through">' + p1 + '</span>')
    .replace(/fullLogo1/g, 'fullLogo3')
    .replace('mailto%3a', 'mailto:')
    .replace('alt="screenshot-passing"', 'alt="screenshot-passing" style="width:100%"')
    .replace(/\$/gi, () => '<span class="dollar-sign">$</span>');
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const request = http
      .request(url, { headers: { 'User-Agent': 'enqueuer-readme' } }, resp => {
        let data = '';
        resp
          .on('data', chunk => {
            data += chunk;
          })
          .on('end', () => {
            resolve({ data: JSON.parse(data), statusCode: resp.statusCode });
          });
      })
      .on('error', err => {
        reject(err);
      });
    request.write('');
    request.end();
  });
}

const pluginsListContributors = [];
const contributorsUsersList = [];

httpGet(`https://raw.githubusercontent.com/enqueuer-land/plugins-list/master/plugins.json`)
  .then(payload => payload.data)
  .then(plugins =>
    plugins
      .sort((first, second) => first.name.localeCompare(second.name))
      .map(plugin => {
        const info = getInfo(plugin.githubUrl);
        contributorsUsersList.push(info);
        pluginsListContributors.push({
          contributors_url: info.contributors_url
        });
        return ` <div class="row no-gutters py-1 plugins-list-row">
                          <div class="col-12 col-md-6 col-lg-3" style="">
                            <a href="${info.userUrl}" target="_blank" style="overflow: scroll; white-space: nowrap;">
                                <img src="${info.picture}" style="width: 15%;" class="img-fluid rounded mx-auto px-2 rounded-circle">
                                ${info.name}
                            </a>
                          </div>
                          <div class="col-12 col-md-6 col-lg-3 pl-5 pl-lg-0">
                            <a href="${plugin.githubUrl}" style="overflow: scroll; white-space: nowrap;" target="_blank">${plugin.name}</a>
                          </div>
                          <div class="col-12 col-lg-6 pb-3 pl-5 pl-lg-0 pb-sm-1 pb-lg-0" style="color: var(--nqr-text-smooth-color); overflow: scroll; white-space: nowrap;">
                            ${plugin.description}
                          </div>
                    </div>
                    `;
      })
      .join('')
  )
  .then(innerHtml => {
    return `
                    <div class="container px-0 pt-2"> <!--style="background-color: var(&#45;&#45;nqr-header-background-color)"-->
                      <div class="row no-gutters pb-1">
                        <div class="col-12 col-md-6 col-lg-3"><h5 class="px-1">Author</h5></div>
                        <div class="col-12 col-md-6 col-lg-3"><h5 class="px-1">Name</h5></div>
                        <div class="col-12 col-lg-6 pb-3 pb-sm-1 pb-lg-0"><h5 class="px-1">Description</h5></div>
                      </div>
                    </div>
                    <div class="container-fluid px-0 pb-1" >
                      ${innerHtml}
                    </div>`;
  })
  .then(createHtml);

function getInfo(repo) {
  if (!repo) {
    return null;
  }

  let user = url.parse(repo).path;
  if (user.length && user.charAt(0) === '/') {
    user = user.slice(1);
  }
  const split = user.split('/');
  const repoName = split[1];
  user = split[0];
  return {
    contributors_url: `https://api.github.com/repos/${user}/${repoName}/contributors`,
    picture: `http://github.com/${user}.png`,
    name: user,
    userUrl: `http://github.com/${user}`,
    html_url: `http://github.com/${user}`
  };
}

async function createHtml(pluginsListTable) {
  const contributors = Object.values(
    (await getContributors()).concat(contributorsUsersList).reduce((acc, contributor) => {
      acc[contributor.name] = contributor;
      return acc;
    }, {})
  );
  const contributorsHtml = createContributorsHtml(contributors);
  const readMeHtmlized = converter
    .makeHtml(md)
    .replace('{{plugins list placeholder}}', pluginsListTable)
    .replace('{{contributors list placeholder}}', contributorsHtml);
  spyHtml += `</nav></nav></nav>`;
  const content =
    spyHtml + `<div class="nqr-main-container container" style="max-width: 90%">` + readMeHtmlized + `</div></div>`;

  const htmlResult = template.replace('<!--README CONTENT PLACEHOLDER-->', content);

  fs.writeFileSync('docs/docs.html', htmlResult);
  console.log('Html generated');
}

createContributorsHtml = function (contributors) {
  return (
    `<div class="container-fluid mx-auto p-2" style="width: 100%">
                   <div class="row py-1 align-items-center justify-content-center mx-auto" style="width: 90%">` +
    contributors
      .map(contributor => {
        return ` <div class="col-4 col-md-2 m-1 py-2" style="text-align: center">
                            <a href="${contributor.html_url}" target="_blank">
                                <img src="${contributor.picture}" style="border: none; width: 50%; background-color: var(--nqr-header-background-color);" class="img-fluid rounded rounded-circle img-thumbnail">
                            </a>
                         </div>`;
      })
      .join('') +
    `</div>
           </div>`
  );
};

async function getContributors() {
  return new Promise((resolve, reject) => {
    httpGet(`https://api.github.com/orgs/enqueuer-land/repos?per_page=200`)
      .then(payload => payload.data)
      .then(data => {
        return Promise.all(
          data.concat(pluginsListContributors).map(repo => httpGet(repo.contributors_url).then(payload => payload.data))
        );
      })
      .then(repoContributors => repoContributors.reduce((acc, repoContributor) => acc.concat(repoContributor), []))
      .then(contributors =>
        contributors.reduce((acc, contributor) => {
          if (contributor.type === 'User' /*&& contributor.login !== 'enqueuer-land'*/) {
            acc[contributor.login] = {
              avatar_url: contributor.avatar_url,
              html_url: contributor.html_url,
              login: contributor.login
            };
          }
          return acc;
        }, {})
      )
      .then(contributors => Object.values(contributors))
      .then(contributors =>
        contributors.map(contributor => ({
          picture: `http://github.com/${contributor.login}.png`,
          name: contributor.login,
          html_url: `http://github.com/${contributor.login}`
        }))
      )
      .then(resolve)
      .catch(reject);
  });
}
