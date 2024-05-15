type WindowWithWebAPI = typeof window & {
  Request: (url: RequestInfo, init: RequestInit) => Request;
  XMLHttpRequest: (
    this: typeof XMLHttpRequest,
    method: string,
    url: string,
    asynchronous: boolean,
    user: string,
    password: string
  ) => XMLHttpRequest;
};

const DISALLOWED_HOST = ["malicious.com"];

const PATCHES = {
  XMLHttpRequest(originalXmlHttpRequestOpen: Function) {
    return function (
      this: typeof XMLHttpRequest,
      method: string,
      url: string,
      asynchronous: boolean,
      user: string,
      password: string
    ) {
      if (isInvalidHost(url)) {
        return;
      }

      return originalXmlHttpRequestOpen.call(
        this,
        method,
        url,
        asynchronous,
        user,
        password
      );
    };
  },

  Request(OriginalRequest: typeof Request) {
    return function (url: RequestInfo, init: RequestInit) {
      if (typeof url === "object") {
        return new OriginalRequest(url, init);
      }

      if (isInvalidHost(url)) {
        return;
      }

      return new OriginalRequest(url, init);
    };
  },

  fetch(originalFetch: Function) {
    return function (this: typeof Window, url: RequestInfo, init: RequestInit) {
      if (isInvalidHost(url)) {
        return Promise.reject(new Error("Invalid Host"));
      }

      return originalFetch.call(window, url, init);
    };
  },
};

function isInvalidHost(url?: RequestInfo) {
  if (url === undefined) {
    return true;
  }

  try {
    const host =
      typeof url === "object" ? new URL(url.url).host : new URL(url).host;
    return DISALLOWED_HOST.includes(host);
  } catch (error) {
    return false;
  }
}

function main() {
  const windowWithWebAPI = window as WindowWithWebAPI;

  windowWithWebAPI.Request = PATCHES.Request(Request) as any;
  windowWithWebAPI.fetch = PATCHES.fetch(fetch) as any;
  windowWithWebAPI.XMLHttpRequest.prototype.open = PATCHES.XMLHttpRequest(
    XMLHttpRequest.prototype.open
  ) as any;
}

main();
