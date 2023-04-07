import * as adapter from '@astrojs/netlify/netlify-functions.js';
import { g as server_default, h as deserializeManifest } from './chunks/astro.02344e80.mjs';
import { _ as _page0, a as _page1, b as _page2, c as _page3, d as _page4, e as _page5 } from './chunks/pages/all.a0502936.mjs';
import 'mime';
import 'cookie';
import 'kleur/colors';
import 'slash';
import 'path-to-regexp';
import 'html-escaper';
import 'string-width';
import 'sharp';
/* empty css                                 *//* empty css                                 *//* empty css                                         *//* empty css                                   */import 'svgo';
/* empty css                                  */
const pageMap = new Map([["node_modules/@astrojs/image/dist/endpoint.js", _page0],["src/pages/index.astro", _page1],["src/pages/documentation.astro", _page2],["src/pages/contact.astro", _page3],["src/pages/family.astro", _page4],["src/pages/avoid.astro", _page5],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),];

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoint.js","pathname":"/_image","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/avoid.db92bc2d.css","_astro/index.50cb2a06.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/avoid.db92bc2d.css","_astro/documentation.331668de.css"],"scripts":[],"routeData":{"route":"/documentation","type":"page","pattern":"^\\/documentation\\/?$","segments":[[{"content":"documentation","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/documentation.astro","pathname":"/documentation","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/avoid.db92bc2d.css","_astro/contact.a259e1be.css"],"scripts":[],"routeData":{"route":"/contact","type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/avoid.db92bc2d.css","_astro/family.407c468b.css"],"scripts":[],"routeData":{"route":"/family","type":"page","pattern":"^\\/family\\/?$","segments":[[{"content":"family","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/family.astro","pathname":"/family","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/avoid.db92bc2d.css"],"scripts":[],"routeData":{"route":"/avoid","type":"page","pattern":"^\\/avoid\\/?$","segments":[[{"content":"avoid","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/avoid.astro","pathname":"/avoid","prerender":false,"_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"gfm":true,"smartypants":true},"pageMap":null,"propagation":[],"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"_@astrojs-ssr-virtual-entry.mjs","astro:scripts/before-hydration.js":""},"assets":["/_astro/avoid.db92bc2d.css","/_astro/contact.a259e1be.css","/_astro/documentation.331668de.css","/_astro/family.407c468b.css","/_astro/index.50cb2a06.css","/bani.jpg","/f1.png","/f2.png","/favicon.svg","/fN.png","/fN2.png","/grateful.png","/lorelyn2.gif","/match1.png","/robots.txt","/scam2.png","/scammer.png"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};
const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler, pageMap, renderers };
