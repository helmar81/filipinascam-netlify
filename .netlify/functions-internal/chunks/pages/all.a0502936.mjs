import mime from 'mime';
import sharp from 'sharp';
/* empty css                           */import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, d as renderHead, e as renderSlot, f as renderComponent, s as spreadAttributes, u as unescapeHTML, F as Fragment } from '../astro.02344e80.mjs';
/* empty css                           *//* empty css                                   *//* empty css                             */import { optimize } from 'svgo';
/* empty css                            */
function isOutputFormat(value) {
  return ["avif", "jpeg", "jpg", "png", "webp", "svg"].includes(value);
}
function isOutputFormatSupportsAlpha(value) {
  return ["avif", "png", "webp"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
class BaseSSRService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    if (transform.fit) {
      searchParams.append("fit", transform.fit);
    }
    if (transform.background) {
      searchParams.append("bg", transform.background);
    }
    if (transform.position) {
      searchParams.append("p", encodeURI(transform.position));
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    if (searchParams.has("fit")) {
      transform.fit = searchParams.get("fit");
    }
    if (searchParams.has("p")) {
      transform.position = decodeURI(searchParams.get("p"));
    }
    if (searchParams.has("bg")) {
      transform.background = searchParams.get("bg");
    }
    return transform;
  }
}

class SharpService extends BaseSSRService {
  async transform(inputBuffer, transform) {
    if (transform.format === "svg") {
      return {
        data: inputBuffer,
        format: transform.format
      };
    }
    const sharpImage = sharp(inputBuffer, { failOnError: false, pages: -1 });
    sharpImage.rotate();
    if (transform.width || transform.height) {
      const width = transform.width && Math.round(transform.width);
      const height = transform.height && Math.round(transform.height);
      sharpImage.resize({
        width,
        height,
        fit: transform.fit,
        position: transform.position,
        background: transform.background
      });
    }
    if (transform.format) {
      sharpImage.toFormat(transform.format, { quality: transform.quality });
      if (transform.background && !isOutputFormatSupportsAlpha(transform.format)) {
        sharpImage.flatten({ background: transform.background });
      }
    }
    const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });
    return {
      data,
      format: info.format
    };
  }
}
const service = new SharpService();
var sharp_default = service;

const fnv1a52 = (str) => {
  const len = str.length;
  let i = 0, t0 = 0, v0 = 8997, t1 = 0, v1 = 33826, t2 = 0, v2 = 40164, t3 = 0, v3 = 52210;
  while (i < len) {
    v0 ^= str.charCodeAt(i++);
    t0 = v0 * 435;
    t1 = v1 * 435;
    t2 = v2 * 435;
    t3 = v3 * 435;
    t2 += v0 << 8;
    t3 += v1 << 8;
    t1 += t0 >>> 16;
    v0 = t0 & 65535;
    t2 += t1 >>> 16;
    v1 = t1 & 65535;
    v3 = t3 + (t2 >>> 16) & 65535;
    v2 = t2 & 65535;
  }
  return (v3 & 15) * 281474976710656 + v2 * 4294967296 + v1 * 65536 + (v0 ^ v3 >> 4);
};
const etag = (payload, weak = false) => {
  const prefix = weak ? 'W/"' : '"';
  return prefix + fnv1a52(payload).toString(36) + payload.length.toString(36) + '"';
};

function isRemoteImage(src) {
  return /^(https?:)?\/\//.test(src);
}

async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error(err);
    return void 0;
  }
}
const get$1 = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const transform = sharp_default.parseTransform(url.searchParams);
    let inputBuffer = void 0;
    const sourceUrl = isRemoteImage(transform.src) ? new URL(transform.src) : new URL(transform.src, url.origin);
    inputBuffer = await loadRemoteImage(sourceUrl);
    if (!inputBuffer) {
      return new Response("Not Found", { status: 404 });
    }
    const { data, format } = await sharp_default.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": mime.getType(format) || "",
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(data.toString()),
        Date: new Date().toUTCString()
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get: get$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$f = createAstro();
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead($$result)}<footer class="p-4 bg-white rounded-lg shadow md:px-6 md:py-8  astro-SZ7XMLTE">
  <div class="sm:flex sm:items-center sm:justify-between bg-slate-50 astro-SZ7XMLTE">
      <a href="/" class="flex items-center mb-4 sm:mb-0 astro-SZ7XMLTE">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg" class="h-8 mr-3 astro-SZ7XMLTE" alt="Philippine Flag2">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white astro-SZ7XMLTE">Philippines</span>
      </a>
      <ul class="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400 astro-SZ7XMLTE">

        <li class="astro-SZ7XMLTE">
          <a href="/family" class="mr-4 hover:underline md:mr-6 astro-SZ7XMLTE">Single Moms</a>
      </li>
          <li class="astro-SZ7XMLTE">
              <a href="/documentation" class="mr-4 hover:underline md:mr-6  astro-SZ7XMLTE">Scams</a>
          </li>
          
          <li class="astro-SZ7XMLTE">
              <a href="/avoid" class="mr-4 hover:underline md:mr-6  astro-SZ7XMLTE">Avoid</a>
          </li>
          <li class="astro-SZ7XMLTE">
              <a href="/contact" class="hover:underline astro-SZ7XMLTE">Contact</a>
          </li>
      </ul>
  </div>
  <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8 astro-SZ7XMLTE">
  <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400 astro-SZ7XMLTE">© <a href="/" class="hover:underline astro-SZ7XMLTE">FilipinaScam™</a>
  </span>
</footer>`;
}, "C:/Users/User/filipinascam-netlify/src/components/Footer.astro");

const $$Astro$e = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width">
		<link rel="icon" type="image/svg+xml" href="/favicon.svg">
		<meta name="generator"${addAttribute(Astro2.generator, "content")}>
		<title>${title}</title>
	${renderHead($$result)}</head>
	<body>
		
		<div class="h-14 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
		
		
		
		${renderSlot($$result, $$slots["default"])}

		

		${renderComponent($$result, "Footer", $$Footer, {})}
		
		

	
	</body></html>`;
}, "C:/Users/User/filipinascam-netlify/src/layouts/Layout.astro");

const $$Astro$d = createAstro();
const $$Card = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Card;
  const { href, title, body } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<li class="link-card astro-DOHJNAO5">
	<a${addAttribute(href, "href")} class="astro-DOHJNAO5">
		<h2 class="astro-DOHJNAO5">
			${title}
			<span class="astro-DOHJNAO5">&rarr;</span>
		</h2>
		<p class="astro-DOHJNAO5">
			${body}
		</p>
	</a>
</li>`;
}, "C:/Users/User/filipinascam-netlify/src/components/Card.astro");

const $$Astro$c = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome to th Phillippines.", "class": "astro-J7PV25F6" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="astro-J7PV25F6">
		<h1 class="astro-J7PV25F6"> <span class="text-gradient astro-J7PV25F6">Awesome Filipinas</span></h1>
		<p class="instructions astro-J7PV25F6">
			It is very easy to contact Filipinas on <code class="astro-J7PV25F6">Tinder/Badoo</code> especially when you are already in the country.<br class="astro-J7PV25F6">
			Some of them might be only interested in <strong class="astro-J7PV25F6"> your money</strong>
		</p>
		<ul role="list" class="link-card-grid astro-J7PV25F6">
			${renderComponent($$result2, "Card", $$Card, { "href": "/documentation", "title": "Scams", "body": "I have captured the conversations and attached screenshots", "class": "astro-J7PV25F6" })}
			${renderComponent($$result2, "Card", $$Card, { "href": "/avoid", "title": "Avoid", "body": "There are several things you can do to avoid scams.", "class": "astro-J7PV25F6" })}
			${renderComponent($$result2, "Card", $$Card, { "href": "family/", "title": "Single-Moms", "body": " Filipina single moms face unique challenges.", "class": "astro-J7PV25F6" })}
			${renderComponent($$result2, "Card", $$Card, { "href": "/contact", "title": "Contact", "body": "Come say hi to our amazing community. \u2764\uFE0F", "class": "astro-J7PV25F6" })}
		</ul>	
		
	</main>` })}`;
}, "C:/Users/User/filipinascam-netlify/src/pages/index.astro");

const $$file$4 = "C:/Users/User/filipinascam-netlify/src/pages/index.astro";
const $$url$4 = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file$4,
  url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$b = createAstro();
const $$Container = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Container;
  const { class: className } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute([
    "container px-8 py-5 lg:py-8 mx-auto xl:px-5 max-w-screen-lg",
    className
  ], "class:list")}>
  ${renderSlot($$result, $$slots["default"])}
</div>`;
}, "C:/Users/User/filipinascam-netlify/src/components/container.astro");

const $$Astro$a = createAstro();
const $$Pagetitle = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Pagetitle;
  const { align = "center" } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div${addAttribute([align === "center" && "text-center"], "class:list")}>
  <h1 class="text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-blue">
    ${renderSlot($$result, $$slots["title"], renderTemplate`Philippines`)}
  </h1>
  <p class="text-lg mt-3 text-gray-600">
    ${renderSlot($$result, $$slots["desc"], renderTemplate` <a href="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg"></a>
    `)}
  </p>
</div>`;
}, "C:/Users/User/filipinascam-netlify/src/components/pagetitle.astro");

const $$Astro$9 = createAstro();
const $$Documentation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Documentation;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Video", "class": "astro-7BOUCB6X" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Container", $$Container, { "class": "astro-7BOUCB6X" }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "Pagetitle", $$Pagetitle, { "class": "astro-7BOUCB6X" })}${maybeRenderHead($$result3)}<div class="justify-items-auto astro-7BOUCB6X">

   
    <div class="mt-4 md:mt-0 md:ml-6 astro-7BOUCB6X">
      <div class="uppercase tracking-wide text-sm text-indigo-600 font-bold astro-7BOUCB6X">
        DATING
      </div>
      <a href="/" class="block mt-1 text-lg leading-tight font-semibold text-gray-900 hover:underline astro-7BOUCB6X">
        finding girls online in the Philippines is easy in today's digital age, when you are already in the country. However, it is essential to approach these interactions with caution and respect.

      </a>
      <h2 class="mt-2 text-gray-600 astro-7BOUCB6X">
       
        Here are some conversations I have captured on my trip to the Philippines
      </h2>
    </div>

    



    <div class="max-w-xl rounded overflow-hidden shadow-lg justify-items astro-7BOUCB6X">
      <img class="w-full astro-7BOUCB6X" src="../f2.png" alt="obvious scam">
      <div class="px-6 py-8 astro-7BOUCB6X">
        <div class="font-bold text-xl mb-2 astro-7BOUCB6X">straight to the point</div>
        <p class="text-gray-700 text-base astro-7BOUCB6X">
         60 Euro for probably a one night stand is too much.
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-7BOUCB6X">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#upfront</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#scam</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#avoid</span>
      </div>
    </div>


    <div class="max-w-xl rounded overflow-hidden shadow-lg justify-items astro-7BOUCB6X">
      <img class="w-full astro-7BOUCB6X" src="../scam2.png" alt="obvious scam">
      <div class="px-6 py-8 astro-7BOUCB6X">
        <div class="font-bold text-xl mb-2 astro-7BOUCB6X">Selling nude pictures and videos </div>
        <p class="text-gray-700 text-base astro-7BOUCB6X">
        I had to block her...
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-7BOUCB6X">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#pictures</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#scam</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#avoid</span>
      </div>
    </div>
 

   
    
    <div class="max-w-xl rounded overflow-hidden shadow-lg justify-items-auto astro-7BOUCB6X">
      <img class="w-full astro-7BOUCB6X" src="../f1.png" alt="dinner for three">
      <div class="px-6 py-8 astro-7BOUCB6X">
        <div class="font-bold text-xl mb-2 astro-7BOUCB6X">dinner for three</div>
        <p class="text-gray-700 text-base astro-7BOUCB6X">
         she was already with a friend and was awaiting me to pay the bills, but I didnt show up
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-7BOUCB6X">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#dinner</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#girls</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#scam</span>
      </div>
    </div>
      

    <div class="max-w-xl rounded overflow-hidden shadow-lg justify-items-center astro-7BOUCB6X">
      <img class="w-full astro-7BOUCB6X" src="../fN.png" alt="Nicole">
      <div class="px-6 py-8 justify-items-center astro-7BOUCB6X">
        <div class="font-bold text-xl mb-2 astro-7BOUCB6X">Money for transportation</div>
        <p class="text-gray-700 text-base astro-7BOUCB6X">
          Apparently she is from far away and requesting money upfront to meet
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-7BOUCB6X">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#philippines</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#travel</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#scam</span>
      </div>
    </div>


    <div class="max-w-xl rounded overflow-hidden shadow-lg justify-items-center astro-7BOUCB6X">
      <img class="w-full astro-7BOUCB6X" src="../grateful.png" alt="Rosemar from Boracay">
      <div class="px-6 py-8 astro-7BOUCB6X">
        <div class="font-bold text-xl mb-2 astro-7BOUCB6X">grateful</div>
        <p class="text-gray-700 text-base astro-7BOUCB6X">
         she was so grateful and had not the intention to make an extra income
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-7BOUCB6X">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#grateful</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#travel</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-7BOUCB6X">#noScam</span>
      </div>
    </div>

  </div>` })}` })}`;
}, "C:/Users/User/filipinascam-netlify/src/pages/documentation.astro");

const $$file$3 = "C:/Users/User/filipinascam-netlify/src/pages/documentation.astro";
const $$url$3 = "/documentation";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Documentation,
  file: $$file$3,
  url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$8 = createAstro();
const $$Button = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    size = "md",
    style = "primary",
    block,
    class: className,
    ...rest
  } = Astro2.props;
  const sizes = {
    md: "px-5 py-2.5",
    lg: "px-6 py-3"
  };
  const styles = {
    outline: "border-2 border-black hover:bg-black text-black hover:text-white",
    primary: "bg-black text-white hover:bg-gray-900  border-2 border-transparent"
  };
  return renderTemplate`${maybeRenderHead($$result)}<button${spreadAttributes(rest)}${addAttribute([
    "rounded text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200",
    block && "w-full",
    sizes[size],
    styles[style],
    className
  ], "class:list")}>${renderSlot($$result, $$slots["default"])}
</button>`;
}, "C:/Users/User/filipinascam-netlify/src/components/button.astro");

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$7 = createAstro();
const $$Contactform = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Contactform;
  return renderTemplate(_a || (_a = __template(["<!-- To make this contact form work, create your free access key from https://web3forms.com/\n     Then you will get all form submissions in your email inbox. -->", '<form action="https://api.web3forms.com/submit" method="POST" id="form" class="needs-validation astro-UWNXE3I2" novalidate>\n  <input type="hidden" name="access_key" value="923de864-4f3e-49f2-83f3-b23efd07cf67" class="astro-UWNXE3I2">\n  <!-- Create your free access key from https://web3forms.com/ -->\n  <input type="checkbox" class="hidden astro-UWNXE3I2" style="display:none" name="botcheck">\n  <div class="mb-5 astro-UWNXE3I2">\n    <input type="text" placeholder="Full Name" required class="w-full px-4 py-3 border-2 placeholder:text-gray-800 rounded-md outline-none focus:ring-4 border-gray-300 focus:border-gray-600 ring-gray-100 astro-UWNXE3I2" name="name">\n    <div class="empty-feedback invalid-feedback text-red-400 text-sm mt-1 astro-UWNXE3I2">\n      Please provide your full name.\n    </div>\n  </div>\n  <div class="mb-5 astro-UWNXE3I2">\n    <label for="email_address" class="sr-only astro-UWNXE3I2">Email Address</label><input id="email_address" type="email" placeholder="Email Address" name="email" required class="w-full px-4 py-3 border-2 placeholder:text-gray-800 rounded-md outline-none focus:ring-4 border-gray-300 focus:border-gray-600 ring-gray-100 astro-UWNXE3I2">\n    <div class="empty-feedback text-red-400 text-sm mt-1 astro-UWNXE3I2">\n      Please provide your email address.\n    </div>\n    <div class="invalid-feedback text-red-400 text-sm mt-1 astro-UWNXE3I2">\n      Please provide a valid email address.\n    </div>\n  </div>\n  <div class="mb-3 astro-UWNXE3I2">\n    <textarea name="message" required placeholder="Your Message" class="w-full px-4 py-3 border-2 placeholder:text-gray-800 rounded-md outline-none h-36 focus:ring-4 border-gray-300 focus:border-gray-600 ring-gray-100 astro-UWNXE3I2"></textarea>\n    <div class="empty-feedback invalid-feedback text-red-400 text-sm mt-1 astro-UWNXE3I2">\n      Please enter your message.\n    </div>\n  </div>\n  ', '\n  <div id="result" class="mt-3 text-center astro-UWNXE3I2"></div>\n</form>\n\n\n\n<script>\n  const form = document.getElementById("form");\n  const result = document.getElementById("result");\n\n  form.addEventListener("submit", function (e) {\n    e.preventDefault();\n    form.classList.add("was-validated");\n    if (!form.checkValidity()) {\n      form.querySelectorAll(":invalid")[0].focus();\n      return;\n    }\n    const formData = new FormData(form);\n    const object = Object.fromEntries(formData);\n    const json = JSON.stringify(object);\n\n    result.innerHTML = "Sending...";\n\n    fetch("https://api.web3forms.com/submit", {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n        Accept: "application/json",\n      },\n      body: json,\n    })\n      .then(async (response) => {\n        let json = await response.json();\n        if (response.status == 200) {\n          result.classList.add("text-green-500");\n          result.innerHTML = json.message;\n        } else {\n          console.log(response);\n          result.classList.add("text-red-500");\n          result.innerHTML = json.message;\n        }\n      })\n      .catch((error) => {\n        console.log(error);\n        result.innerHTML = "Something went wrong!";\n      })\n      .then(function () {\n        form.reset();\n        form.classList.remove("was-validated");\n        setTimeout(() => {\n          result.style.display = "none";\n        }, 5000);\n      });\n  });\n<\/script>'])), maybeRenderHead($$result), renderComponent($$result, "Button", $$Button, { "type": "submit", "size": "lg", "block": true, "class": "astro-UWNXE3I2" }, { "default": ($$result2) => renderTemplate`Send Message` }));
}, "C:/Users/User/filipinascam-netlify/src/components/contactform.astro");

const SPRITESHEET_NAMESPACE = `astroicon`;

const baseURL = "https://api.astroicon.dev/v1/";
const requests = /* @__PURE__ */ new Map();
const fetchCache = /* @__PURE__ */ new Map();
async function get(pack, name) {
  const url = new URL(`./${pack}/${name}`, baseURL).toString();
  if (requests.has(url)) {
    return await requests.get(url);
  }
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }
  let request = async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const contentType = res.headers.get("Content-Type");
    if (!contentType.includes("svg")) {
      throw new Error(`[astro-icon] Unable to load "${name}" because it did not resolve to an SVG!

Recieved the following "Content-Type":
${contentType}`);
    }
    const svg = await res.text();
    fetchCache.set(url, svg);
    requests.delete(url);
    return svg;
  };
  let promise = request();
  requests.set(url, promise);
  return await promise;
}

const splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim;
const domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm;
const splitAttrs = (str) => {
  let res = {};
  let token;
  if (str) {
    splitAttrsTokenizer.lastIndex = 0;
    str = " " + (str || "") + " ";
    while (token = splitAttrsTokenizer.exec(str)) {
      res[token[1]] = token[3];
    }
  }
  return res;
};
function optimizeSvg(contents, name, options) {
  return optimize(contents, {
    plugins: [
      "removeDoctype",
      "removeXMLProcInst",
      "removeComments",
      "removeMetadata",
      "removeXMLNS",
      "removeEditorsNSData",
      "cleanupAttrs",
      "minifyStyles",
      "convertStyleToAttrs",
      {
        name: "cleanupIDs",
        params: { prefix: `${SPRITESHEET_NAMESPACE}:${name}` }
      },
      "removeRasterImages",
      "removeUselessDefs",
      "cleanupNumericValues",
      "cleanupListOfValues",
      "convertColors",
      "removeUnknownsAndDefaults",
      "removeNonInheritableGroupAttrs",
      "removeUselessStrokeAndFill",
      "removeViewBox",
      "cleanupEnableBackground",
      "removeHiddenElems",
      "removeEmptyText",
      "convertShapeToPath",
      "moveElemsAttrsToGroup",
      "moveGroupAttrsToElems",
      "collapseGroups",
      "convertPathData",
      "convertTransform",
      "removeEmptyAttrs",
      "removeEmptyContainers",
      "mergePaths",
      "removeUnusedNS",
      "sortAttrs",
      "removeTitle",
      "removeDesc",
      "removeDimensions",
      "removeStyleElement",
      "removeScriptElement"
    ]
  }).data;
}
const preprocessCache = /* @__PURE__ */ new Map();
function preprocess(contents, name, { optimize }) {
  if (preprocessCache.has(contents)) {
    return preprocessCache.get(contents);
  }
  if (optimize) {
    contents = optimizeSvg(contents, name);
  }
  domParserTokenizer.lastIndex = 0;
  let result = contents;
  let token;
  if (contents) {
    while (token = domParserTokenizer.exec(contents)) {
      const tag = token[2];
      if (tag === "svg") {
        const attrs = splitAttrs(token[3]);
        result = contents.slice(domParserTokenizer.lastIndex).replace(/<\/svg>/gim, "").trim();
        const value = { innerHTML: result, defaultProps: attrs };
        preprocessCache.set(contents, value);
        return value;
      }
    }
  }
}
function normalizeProps(inputProps) {
  const size = inputProps.size;
  delete inputProps.size;
  const w = inputProps.width ?? size;
  const h = inputProps.height ?? size;
  const width = w ? toAttributeSize(w) : void 0;
  const height = h ? toAttributeSize(h) : void 0;
  return { ...inputProps, width, height };
}
const toAttributeSize = (size) => String(size).replace(/(?<=[0-9])x$/, "em");
async function load(name, inputProps, optimize) {
  const key = name;
  if (!name) {
    throw new Error("<Icon> requires a name!");
  }
  let svg = "";
  let filepath = "";
  if (name.includes(":")) {
    const [pack, ..._name] = name.split(":");
    name = _name.join(":");
    filepath = `/src/icons/${pack}`;
    let get$1;
    try {
      const files = /* #__PURE__ */ Object.assign({

});
      const keys = Object.fromEntries(
        Object.keys(files).map((key2) => [key2.replace(/\.[cm]?[jt]s$/, ""), key2])
      );
      if (!(filepath in keys)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const mod = files[keys[filepath]];
      if (typeof mod.default !== "function") {
        throw new Error(
          `[astro-icon] "${filepath}" did not export a default function!`
        );
      }
      get$1 = mod.default;
    } catch (e) {
    }
    if (typeof get$1 === "undefined") {
      get$1 = get.bind(null, pack);
    }
    const contents = await get$1(name, inputProps);
    if (!contents) {
      throw new Error(
        `<Icon pack="${pack}" name="${name}" /> did not return an icon!`
      );
    }
    if (!/<svg/gim.test(contents)) {
      throw new Error(
        `Unable to process "<Icon pack="${pack}" name="${name}" />" because an SVG string was not returned!

Recieved the following content:
${contents}`
      );
    }
    svg = contents;
  } else {
    filepath = `/src/icons/${name}.svg`;
    try {
      const files = /* #__PURE__ */ Object.assign({});
      if (!(filepath in files)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const contents = files[filepath];
      if (!/<svg/gim.test(contents)) {
        throw new Error(
          `Unable to process "${filepath}" because it is not an SVG!

Recieved the following content:
${contents}`
        );
      }
      svg = contents;
    } catch (e) {
      throw new Error(
        `[astro-icon] Unable to load "${filepath}". Does the file exist?`
      );
    }
  }
  const { innerHTML, defaultProps } = preprocess(svg, key, { optimize });
  if (!innerHTML.trim()) {
    throw new Error(`Unable to parse "${filepath}"!`);
  }
  return {
    innerHTML,
    props: { ...defaultProps, ...normalizeProps(inputProps) }
  };
}

const $$Astro$6 = createAstro();
const $$Icon = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Icon;
  let { name, pack, title, optimize = true, class: className, ...inputProps } = Astro2.props;
  let props = {};
  if (pack) {
    name = `${pack}:${name}`;
  }
  let innerHTML = "";
  try {
    const svg = await load(name, { ...inputProps, class: className }, optimize);
    innerHTML = svg.innerHTML;
    props = svg.props;
  } catch (e) {
    {
      throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
    }
  }
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(name, "astro-icon")}>${unescapeHTML((title ? `<title>${title}</title>` : "") + innerHTML)}</svg>`;
}, "C:/Users/User/filipinascam-netlify/node_modules/astro-icon/lib/Icon.astro");

const sprites = /* @__PURE__ */ new WeakMap();
function trackSprite(request, name) {
  let currentSet = sprites.get(request);
  if (!currentSet) {
    currentSet = /* @__PURE__ */ new Set([name]);
  } else {
    currentSet.add(name);
  }
  sprites.set(request, currentSet);
}
const warned = /* @__PURE__ */ new Set();
async function getUsedSprites(request) {
  const currentSet = sprites.get(request);
  if (currentSet) {
    return Array.from(currentSet);
  }
  if (!warned.has(request)) {
    const { pathname } = new URL(request.url);
    console.log(`[astro-icon] No sprites found while rendering "${pathname}"`);
    warned.add(request);
  }
  return [];
}

const $$Astro$5 = createAstro();
const $$Spritesheet = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Spritesheet;
  const { optimize = true, style, ...props } = Astro2.props;
  const names = await getUsedSprites(Astro2.request);
  const icons = await Promise.all(names.map((name) => {
    return load(name, {}, optimize).then((res) => ({ ...res, name })).catch((e) => {
      {
        throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
      }
    });
  }));
  return renderTemplate`${maybeRenderHead($$result)}<svg${addAttribute(`position: absolute; width: 0; height: 0; overflow: hidden; ${style ?? ""}`.trim(), "style")}${spreadAttributes({ "aria-hidden": true, ...props })} astro-icon-spritesheet>
    ${icons.map((icon) => renderTemplate`<symbol${spreadAttributes(icon.props)}${addAttribute(`${SPRITESHEET_NAMESPACE}:${icon.name}`, "id")}>${unescapeHTML(icon.innerHTML)}</symbol>`)}
</svg>`;
}, "C:/Users/User/filipinascam-netlify/node_modules/astro-icon/lib/Spritesheet.astro");

const $$Astro$4 = createAstro();
const $$SpriteProvider = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$SpriteProvider;
  const content = await Astro2.slots.render("default");
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(content)}` })}
${renderComponent($$result, "Spritesheet", $$Spritesheet, {})}`;
}, "C:/Users/User/filipinascam-netlify/node_modules/astro-icon/lib/SpriteProvider.astro");

const $$Astro$3 = createAstro();
const $$Sprite = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Sprite;
  let { name, pack, title, class: className, x, y, ...inputProps } = Astro2.props;
  const props = normalizeProps(inputProps);
  if (pack) {
    name = `${pack}:${name}`;
  }
  const href = `#${SPRITESHEET_NAMESPACE}:${name}`;
  trackSprite(Astro2.request, name);
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(className, "class")}${addAttribute(name, "astro-icon")}>
    ${title ? renderTemplate`<title>${title}</title>` : ""}
    <use${spreadAttributes({ "xlink:href": href, width: props.width, height: props.height, x, y })}></use>
</svg>`;
}, "C:/Users/User/filipinascam-netlify/node_modules/astro-icon/lib/Sprite.astro");

Object.assign($$Sprite, { Provider: $$SpriteProvider });

const $$Astro$2 = createAstro();
const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Contact;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Contact" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Container", $$Container, {}, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "Pagetitle", $$Pagetitle, {}, { "desc": ($$result4) => renderTemplate`${renderComponent($$result4, "Fragment", Fragment, { "slot": "desc" }, { "default": ($$result5) => renderTemplate`I am here to reply.` })}`, "title": ($$result4) => renderTemplate`${renderComponent($$result4, "Fragment", Fragment, { "slot": "title" }, { "default": ($$result5) => renderTemplate`Contact` })}` })}${maybeRenderHead($$result3)}<div class="grid md:grid-cols-2 gap-10 mx-auto max-w-4xl mt-16">
      <div>
        <h2 class="font-medium text-2xl text-gray-800">Contact me</h2>
        <p class="text-lg leading-relaxed text-gray-500 mt-3">
          Have something to say? I am here to respond. Fill up the form or send
          email or call phone.
        </p>
        <div class="mt-5">
          <div class="flex items-center mt-2 space-x-2 text-gray-600">
            ${renderComponent($$result3, "Icon", $$Icon, { "class": "text-gray-400 w-4 h-4", "name": "uil:map-marker" })}
            <span>Asia</span>
          </div><div class="flex items-center mt-2 space-x-2 text-gray-600">
            ${renderComponent($$result3, "Icon", $$Icon, { "class": "text-gray-400 w-4 h-4", "name": "uil:envelope" })}<a href="mailto:hello@stablotemplate.com">helmar81@gmail.com</a>
          </div><div class="flex items-center mt-2 space-x-2 text-gray-600">
            ${renderComponent($$result3, "Icon", $$Icon, { "class": "text-gray-400 w-4 h-4", "name": "uil:phone" })}<a href="tel:+1 (987) 4587 899">+84 328831547</a>
          </div>
        </div>
      </div>
      <div>
        ${renderComponent($$result3, "Contactform", $$Contactform, {})}
      </div>
    </div>` })}` })}`;
}, "C:/Users/User/filipinascam-netlify/src/pages/contact.astro");

const $$file$2 = "C:/Users/User/filipinascam-netlify/src/pages/contact.astro";
const $$url$2 = "/contact";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contact,
  file: $$file$2,
  url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$1 = createAstro();
const $$Family = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Family;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Video", "class": "astro-CMMOMPQJ" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Container", $$Container, { "class": "astro-CMMOMPQJ" }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "Pagetitle", $$Pagetitle, { "class": "astro-CMMOMPQJ" })}${maybeRenderHead($$result3)}<div class="mt-4 md:mt-0 md:ml-6 astro-CMMOMPQJ">
      <div class="uppercase tracking-wide text-sm text-indigo-600 font-bold text-justify astro-CMMOMPQJ">
        Single Moms      </div>
      <a href="/" class="block mt-1 text-lg leading-tight font-semibold text-gray-900 hover:underline astro-CMMOMPQJ">
        Filipina single moms face unique challenges as they raise their children on their own. Here are some things to consider:

Financial struggles: Many single moms in the Philippines struggle to make ends meet as they raise their children on a single income. They may need to work long hours or multiple jobs to provide for their families.

Social stigma: Single motherhood is often stigmatized in Filipino society, and single moms may face discrimination and judgment from others.

Childcare: Finding affordable and reliable childcare can be a challenge for single moms, especially if they work long or irregular hours.

Emotional support: Single moms may feel isolated and unsupported as they navigate the challenges of raising their children on their own. It's important for them to have a strong support network of friends and family members who can offer emotional support and practical help.

Despite these challenges, many Filipina single moms are able to provide their children with loving homes and successful futures. It's important to acknowledge and support their hard work and dedication.

      </a>
      
    </div><div class="max-w-xl rounded overflow-hidden shadow-lg py-8   astro-CMMOMPQJ">
      <img class="w-full bg-origin-paddingease-in astro-CMMOMPQJ" src="../lorelyn2.gif" alt="Great Pretender">
      <div class="px-6 py-8 self-center astro-CMMOMPQJ">
        <div class="font-bold text-xl mb-2 astro-CMMOMPQJ">Single Mom</div>
        <p class="text-gray-700 text-base astro-CMMOMPQJ">
       she is living in paradise and looking for a sponsor...
        </p>
      </div>
      <div class="px-6 pt-4 pb-2 astro-CMMOMPQJ">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-CMMOMPQJ">#diligent</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-CMMOMPQJ">#ambitious</span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 astro-CMMOMPQJ">#progressive</span>
      </div>
      
    </div>` })}` })}`;
}, "C:/Users/User/filipinascam-netlify/src/pages/family.astro");

const $$file$1 = "C:/Users/User/filipinascam-netlify/src/pages/family.astro";
const $$url$1 = "/family";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Family,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro();
const $$Avoid = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Avoid;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Video" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Container", $$Container, {}, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "Pagetitle", $$Pagetitle, {})}${maybeRenderHead($$result3)}<div class="mt-4 md:mt-0 md:ml-6">
      <div class="uppercase tracking-wide text-sm text-indigo-600 font-bold">
        Avoid
      </div>

      <div class="uppercase tracking-wide text-xl text-indigo-600 font-bold text-justify">
    
       <h2> There are several things you can do to avoid scams: </h2>
   

<ul>
<li>
1. Be wary of unsolicited emails, messages, or phone calls: Scammers often contact people out of the blue to offer deals that are too good to be true. Be cautious of any unexpected communication and do not provide personal information or payment details unless you are absolutely certain of the legitimacy of the request.
</li>

<li>
    2. Research the company or individual: Do a quick online search to see if the company or person contacting you has a good reputation. Look for reviews or complaints from other customers.
    </li>

    <li>
       3. Be cautious when providing personal information: Do not give out personal information such as your social security number, bank account number, or credit card details unless you are sure of the legitimacy of the request.
        </li>

        <li>
            4. Check the website's security: When making a payment or entering personal information on a website, make sure the website has a secure connection (look for "https" at the beginning of the URL and a padlock symbol in the address bar).
             </li>

             <li>
                5. Trust your instincts: If something seems too good to be true or feels off, trust your gut and walk away.
                 </li>
                 <li>
                    6. Keep your software up to date: Make sure your computer, smartphone, and other devices are up to date with the latest software updates and security patches
                     </li>
                     <li>
                        7. Use strong passwords: Use strong passwords that are difficult to guess or hack.
                         </li>
</ul>
     <p>By following these tips, you can protect yourself from scams and avoid becoming a victim of fraud.</p>
      
    </div>

</div>` })}` })}`;
}, "C:/Users/User/filipinascam-netlify/src/pages/avoid.astro");

const $$file = "C:/Users/User/filipinascam-netlify/src/pages/avoid.astro";
const $$url = "/avoid";

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Avoid,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page0 as _, _page1 as a, _page2 as b, _page3 as c, _page4 as d, _page5 as e };
