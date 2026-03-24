import { addRoute, initRouter } from './router.js';
import { renderHome }    from './pages/home.js';
import { renderProject } from './pages/project.js';
import { initBackground } from './webgpu.js';

// ── Routes ────────────────────────────────────────────────────────────────
addRoute('',                 renderHome);
addRoute('project/:name',   renderProject);

// ── Boot ──────────────────────────────────────────────────────────────────
initRouter();
// initBackground();
