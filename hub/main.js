(async () => {
  const res = await fetch('../');
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, 'text/html');

  const dirs = [...doc.querySelectorAll('a')]
    .map(a => a.getAttribute('href'))
    .filter(href =>
      href &&
      href.endsWith('/') &&
      !href.startsWith('.') &&
      !['hub/', 'assets/'].includes(href)
    );

  const root = document.getElementById('list');

  dirs.forEach(dir => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <a href="../${dir}">
        <strong>${dir.replace('/', '')}</strong>
        <div class="path">/${dir}</div>
      </a>
    `;
    root.appendChild(card);
  });
})();
