/*
 * Project detail page logic:
 * - Reads ?p=<slug> from the URL
 * - Loads projects.json and renders the matching project
 */

function safeStatusClass(status) {
  return `status--${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function renderMedia(project) {
  const media = document.getElementById('detail-media');
  media.innerHTML = '';

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
      media.appendChild(video);
      return;
    }
    const img = document.createElement('img');
    img.src = project.thumbnail;
    img.alt = project.name;
    media.appendChild(img);
    return;
  }

  const placeholder = document.createElement('div');
  placeholder.className = 'project-detail__placeholder';
  placeholder.innerHTML = '<span>Thumbnail / GIF coming soon</span>';
  media.appendChild(placeholder);
}

function renderProject(project) {
  document.title = `${project.name} — Stephen Zhu`;

  const statusEl = document.getElementById('detail-status');
  statusEl.className = `project-detail__status ${safeStatusClass(project.status)}`;
  statusEl.textContent = project.status;

  document.getElementById('detail-year').textContent = project.year;
  document.getElementById('detail-title').textContent = project.name;
  document.getElementById('detail-tagline').textContent = project.tagline;

  const summaryEl = document.getElementById('detail-summary');
  summaryEl.innerHTML = '';
  const summaryP = document.createElement('p');
  summaryP.textContent = project.summary;
  summaryEl.appendChild(summaryP);

  const detailsEl = document.getElementById('detail-details');
  detailsEl.innerHTML = '';
  project.details.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    detailsEl.appendChild(p);
  });

  const techEl = document.getElementById('detail-tech');
  techEl.innerHTML = '';
  project.tech.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    techEl.appendChild(li);
  });

  const repoLink = document.getElementById('detail-repo');
  repoLink.href = project.repo;

  renderMedia(project);

  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('is-visible');
  });
}

function showError(message) {
  const detail = document.getElementById('project-detail');
  detail.innerHTML = `
    <div class="container project-detail__container" style="padding-top:4rem;text-align:center">
      <a class="project-detail__back" href="index.html#projects">&larr; Back to projects</a>
      <h1 style="margin-top:2rem">${message}</h1>
      <p style="color:var(--muted);margin-top:1rem">Check the URL slug or return to the projects list.</p>
    </div>
  `;
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('p');

  if (!slug) {
    showError('No project selected.');
    return;
  }

  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error('Could not load projects.json');
    const data = await response.json();
    const project = (data.projects || []).find((p) => p.slug === slug);

    if (!project) {
      showError('Project not found.');
      return;
    }

    renderProject(project);
  } catch (err) {
    console.error(err);
    showError('Unable to load project details.');
  }
}

init();
