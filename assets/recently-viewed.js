/*
 * 最近見た商品（Phase 9a）
 *
 * - 商品ページで現在の商品 handle を localStorage に記録（最新を先頭・重複排除・上限あり）。
 * - 表示時は記録済み handle（現在の商品を除外）を最新順に取り出し、
 *   Section Rendering API（/products/{handle}?section_id=）で各カードを取得してグリッドに差し込む。
 * - localStorage が使えない／履歴が無い場合はセクションを表示しない（hidden のまま）。
 */
const RECENTLY_VIEWED_KEY = 'sweet-atelier:recently-viewed';
const RECENTLY_VIEWED_MAX = 12;

function readRecentlyViewed() {
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((handle) => typeof handle === 'string' && handle) : [];
  } catch (e) {
    return [];
  }
}

function recordRecentlyViewed(handle) {
  if (!handle) return;
  try {
    const handles = readRecentlyViewed().filter((stored) => stored !== handle);
    handles.unshift(handle);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(handles.slice(0, RECENTLY_VIEWED_MAX)));
  } catch (e) {
    /* プライベートモード等で localStorage が使えない場合は何もしない */
  }
}

class RecentlyViewedProducts extends HTMLElement {
  connectedCallback() {
    this.currentHandle = this.dataset.currentHandle || '';
    this.rootUrl = this.dataset.rootUrl || '/';
    this.sectionId = this.dataset.sectionId;
    this.limit = parseInt(this.dataset.limit, 10) || 4;
    this.list = this.querySelector('ul');
    this.heading = this.querySelector('.recently-viewed__heading');

    // 商品ページなら閲覧履歴に記録（表示の有無に関わらず）
    if (this.currentHandle) recordRecentlyViewed(this.currentHandle);

    // host 側に初期描画された現在商品カードはクリアしてから再構築する
    if (this.list) this.list.innerHTML = '';

    const handles = readRecentlyViewed()
      .filter((handle) => handle !== this.currentHandle)
      .slice(0, this.limit);

    if (!handles.length || !this.list) return;

    // wrapper は hidden（display:none）なので IntersectionObserver は交差を検知できない。
    // 取得は最大数件・軽量なので遅延ロードはせず、その場で取得して描画する。
    this.loadCards(handles);
  }

  loadCards(handles) {
    Promise.all(handles.map((handle) => this.fetchCard(handle))).then((cards) => {
      const valid = cards.filter((card) => card);
      if (!valid.length) return;
      valid.forEach((card) => this.list.appendChild(card));
      if (this.heading) this.heading.hidden = false;
      this.hidden = false;
    });
  }

  fetchCard(handle) {
    const url = `${this.rootUrl.replace(/\/$/, '')}/products/${encodeURIComponent(handle)}?section_id=${this.sectionId}`;
    return fetch(url)
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => {
        if (!text) return null;
        const fragment = new DOMParser().parseFromString(text, 'text/html');
        return fragment.querySelector('.grid__item');
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  }
}

customElements.define('recently-viewed-products', RecentlyViewedProducts);
