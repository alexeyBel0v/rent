const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Шапка: фон при прокрутке
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Мобильное меню
const menu = document.querySelector<HTMLElement>('[data-menu]');
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
const setMenu = (open: boolean) => {
  menu?.classList.toggle('hidden', !open);
  burger?.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
};
burger?.addEventListener('click', () => setMenu(true));
document.querySelector('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
document.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

// Появление блоков
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
  { rootMargin: '0px 0px -8% 0px' },
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// 3D-наклон
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll<HTMLElement>('.tilt').forEach((el) => {
    const max = Number(el.dataset.tilt ?? 10);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg)`;
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// Заливка ползунков
export const paintRange = (r: HTMLInputElement) => {
  const p = ((Number(r.value) - Number(r.min)) / (Number(r.max) - Number(r.min))) * 100;
  r.style.setProperty('--p', `${p}%`);
};
document.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((r) => {
  paintRange(r);
  r.addEventListener('input', () => paintRange(r));
});

// Счётчики
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count);
  const obs = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return;
    obs.disconnect();
    if (reduce) { el.textContent = target.toLocaleString('ru-RU'); return; }
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4))).toLocaleString('ru-RU');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  obs.observe(el);
});
