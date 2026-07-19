/*
 * Main portfolio logic:
 * - Load projects from projects.json (with a local fallback for file://)
 * - Render project cards and filter by status
 * - Mobile nav, scroll header
 */

const GRID = document.getElementById('projects-grid');
const FILTER_BTNS = document.querySelectorAll('.filter__btn');
const NAV_TOGGLE = document.querySelector('.nav__toggle');
const NAV_LINKS = document.querySelector('.nav__links');
const HEADER = document.querySelector('.site-header');
const YEAR = document.getElementById('year');

if (YEAR) YEAR.textContent = new Date().getFullYear();

function safeStatusClass(status) {
  return `status--${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function renderMedia(project) {
  if (project.thumbnail) {
    const ext = project.thumbnail.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'mov'].includes(ext) || project.thumbnailVideo) {
      const src = project.thumbnailVideo || project.thumbnail;
      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      return video;
    }
    const img = document.createElement('img');
    img.src = project.thumbnail;
    img.alt = project.name;
    img.loading = 'lazy';
    return img;
  }
  const placeholder = document.createElement('div');
  placeholder.className = 'project-card__placeholder';
  placeholder.innerHTML = '<span>Thumbnail / GIF coming soon</span>';
  return placeholder;
}

function createCard(project) {
  const card = document.createElement('a');
  card.className = 'project-card';
  card.href = `project.html?p=${encodeURIComponent(project.slug)}`;

  const media = document.createElement('div');
  media.className = 'project-card__media';
  media.appendChild(renderMedia(project));

  const body = document.createElement('div');
  body.className = 'project-card__body';

  const top = document.createElement('div');
  top.className = 'project-card__top';

  const status = document.createElement('span');
  status.className = `project-card__status ${safeStatusClass(project.status)}`;
  status.textContent = project.status;

  const year = document.createElement('span');
  year.className = 'project-card__year';
  year.textContent = project.year;

  top.append(status, year);

  const title = document.createElement('h3');
  title.className = 'project-card__title';
  title.textContent = project.name;

  const summary = document.createElement('p');
  summary.className = 'project-card__summary';
  summary.textContent = project.summary;

  const tags = document.createElement('div');
  tags.className = 'project-card__tags';
  project.tech.slice(0, 5).forEach((t) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t;
    tags.appendChild(tag);
  });

  body.append(top, title, summary, tags);
  card.append(media, body);
  return card;
}

function renderProjects(projects, filter = 'all') {
  GRID.innerHTML = '';
  const visible = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter);

  visible.forEach((p) => GRID.appendChild(createCard(p)));
}

async function loadProjects() {
  if (window.location.protocol === 'file:' && Array.isArray(window.PROJECTS)) {
    return window.PROJECTS;
  }
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error('Could not load projects.json');
    const data = await response.json();
    return data.projects || [];
  } catch (err) {
    console.error(err);
    if (Array.isArray(window.PROJECTS)) return window.PROJECTS;
    throw err;
  }
}

async function init() {
  if (!GRID) return;
  try {
    const projects = await loadProjects();

    FILTER_BTNS.forEach((btn) => {
      btn.addEventListener('click', () => {
        FILTER_BTNS.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        renderProjects(projects, btn.dataset.filter);
      });
    });

    renderProjects(projects);
  } catch (err) {
    console.error(err);
    if (GRID) GRID.innerHTML = '<p class="projects__note">Unable to load projects. If you opened this file directly, use <code>python3 -m http.server 8000</code> or a deployed URL.</p>';
  }
}

/* Mobile nav */
NAV_TOGGLE.addEventListener('click', () => {
  const expanded = NAV_TOGGLE.getAttribute('aria-expanded') === 'true';
  NAV_TOGGLE.setAttribute('aria-expanded', String(!expanded));
  NAV_LINKS.classList.toggle('is-open');
});

NAV_LINKS.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    NAV_TOGGLE.setAttribute('aria-expanded', 'false');
    NAV_LINKS.classList.remove('is-open');
  });
});

/* Scroll header */
window.addEventListener('scroll', () => {
  HEADER.classList.toggle('is-scrolled', window.scrollY > 50);
}, { passive: true });

init();
