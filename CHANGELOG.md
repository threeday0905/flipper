## v0.4.1
- add destroy() callback

## v0.4.0
- upgrade webcomponentsjs to v0.6.0
- upgrade xtemplate to v4.2.0. ( and fix bug in local version)
- update build process ( use npm to instead of bower )
- rename build files to xxx-debug.js & xxx.js
- remove flipper-common.html file

## v0.3.3
- New feature - node.renderView() will use its template commands.

## v0.3.2
- Add Promise, URL polyfill.
- Some Bugs fixs. Support Opera browser, and some China browsers which based on old-version chrome.

## v0.3.0
- Integrate with [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs). Support Firefox, Safari.
- Change default injection-mode to "light-dom". (Actually shadow dom is not suitable for common application)
- Remove jQuery dependency, use native DOM api.
- Remove bootstrap.

## v0.2.0
- Release Beta version, used in Alibaba Digo Project.
- Only support Chrome browser.

## v0.1.1
- Support two kind of injection mode. Shadow-dom and light dom. Default is "shadow dom".
- Add template mechanism, default support xtemplate.
- Add loader mechanism, defeault support KMD.

## v0.1.0
- For some reason, abandon Polymer solution. Re-develop this library.
- Integrate bootstrap, jQuery by default.
- Focus, and only focus on component life cycle.
- Open the api for develop to choice the suitable solution. So that developer can choice to use angular, xtemplate, react, etc.

## v0.0.1
- Based on Polymer, the first version.
