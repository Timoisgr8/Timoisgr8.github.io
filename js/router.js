// Hash-based SPA router
// Routes: '#/'  → home page
//         '#/project/:name' → project detail page

const routes = [];

export function addRoute(pattern, handler) {
  routes.push({ pattern, handler });
}

function matchRoute(hash) {
  const path = hash.replace(/^#\/?/, '') || '';
  for (const route of routes) {
    const keys = [];
    const regexStr = route.pattern
      .replace(/:([^/]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; });
    const match = path.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params = {};
      keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
      return { handler: route.handler, params };
    }
  }
  return null;
}

async function dispatch() {
  const hash = window.location.hash || '#/';
  const matched = matchRoute(hash);
  if (matched) {
    await matched.handler(matched.params);
  } else {
    // Fallback to home
    const home = matchRoute('#/');
    if (home) await home.handler({});
  }
}

export function navigate(path) {
  window.location.hash = path;
}

export function initRouter() {
  window.addEventListener('hashchange', dispatch);
  dispatch(); // render on first load
}
