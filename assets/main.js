/* 공통 스크립트
   - data/*.json 을 읽어 window.SITE 로 합친 뒤, 헤더/푸터를 그리고 각 페이지의 render(S) 를 호출합니다.
   - 콘텐츠는 /admin 관리 화면(또는 GitHub에서 data/*.json 직접 편집)으로 수정합니다. */
(async function () {
  const get = f => fetch('data/' + f + '.json', { cache: 'no-cache' }).then(r => r.json());
  const [settings, about, members, notices, news, projects, publications, seminars, resources] = await Promise.all(
    ['settings', 'about', 'members', 'notices', 'news', 'projects', 'publications', 'seminars', 'resources'].map(get));
  const byOrder = (a, b) => (a.order ?? 100) - (b.order ?? 100);
  const S = window.SITE = {
    ...settings, ...about,
    members: (members.items || []).sort(byOrder),
    notices: notices.items || [],
    news: news.items || [],
    projects: (projects.items || []).sort(byOrder),
    publications: publications.items || [],
    seminars: seminars.items || [],
    resources: resources.items || []
  };

  const path = location.pathname.split('/').pop() || 'index.html';
  const navHtml = S.nav.map(n => `<a href="${n.href}" class="${n.href === path ? 'active' : ''}">${n.label}</a>`).join('');
  document.getElementById('site-header').innerHTML = `
    <div class="container">
      <a class="brand" href="index.html">
        ${S.logo ? `<img class="mark" src="${S.logo}" alt="">` : '<span class="mark">KU</span>'}
        <span class="name">${S.name.ko}<small>${S.name.en}</small></span>
      </a>
      <nav class="nav" id="nav">${navHtml}</nav>
      <button class="nav-toggle" aria-label="menu" onclick="document.getElementById('nav').classList.toggle('open')">&#9776;</button>
    </div>`;
  document.getElementById('site-footer').innerHTML = `
    <div class="container">
      <div>
        <h4>${S.name.ko}</h4>
        <div>${S.name.en}</div>
        <div style="margin-top:10px">${S.contact.address}</div>
        <div>TEL ${S.contact.tel} &middot; <a href="mailto:${S.contact.email}">${S.contact.email}</a></div>
      </div>
      <div><h4>Menu</h4>${S.nav.map(n => `<div><a href="${n.href}">${n.label}</a></div>`).join('')}</div>
      <div><h4>Links</h4>${S.links.map(l => `<div><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></div>`).join('')}
        <div style="margin-top:14px"><a href="admin/" style="font-size:.8rem;opacity:.6">관리자</a></div></div>
      <div class="copy">&copy; ${new Date().getFullYear()} ${S.name.en}, Korea University. All rights reserved.</div>
    </div>`;
  const hero = document.querySelector('.hero');
  if (hero && S.heroImage) {
    hero.classList.add('has-img');
    hero.style.backgroundImage = `linear-gradient(120deg, rgba(43,0,16,.85), rgba(139,0,41,.6)), url("${S.heroImage}")`;
  }
  if (S.testBanner) {
    const b = document.createElement('div');
    b.className = 'banner';
    b.textContent = S.testBanner;
    document.body.prepend(b);
  }
  if (typeof window.render === 'function') window.render(S);
})().catch(err => {
  console.error(err);
  document.getElementById('site-header').innerHTML = '<div class="container" style="color:#8B0029">데이터를 불러오지 못했습니다. data/*.json 형식을 확인하세요.</div>';
});

window.fmtDate = d => (d || '').slice(0, 10).replace(/-/g, '.');
window.initials = name => /[가-힣]/.test(name) ? name[0] : name.replace(/\s.*/, '').slice(0, 2);
window.avatar = m => m.photo ? `<img class="avatar" src="${m.photo}" alt="${m.name}" style="object-fit:cover">` : `<div class="avatar">${initials(m.name)}</div>`;
window.byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');
window.tabs = function (root) {
  const btns = root.querySelectorAll('.tabs button');
  const panels = root.querySelectorAll('.panel');
  btns.forEach(b => b.onclick = () => {
    btns.forEach(x => x.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    b.classList.add('active');
    root.querySelector('#' + b.dataset.panel).classList.add('active');
  });
  const hash = location.hash.slice(1);
  const target = hash && root.querySelector(`[data-panel="${hash}"]`);
  if (target) target.click();
};
