/*
 * お気に入り（Phase 9b）
 *
 * - localStorage キー sweet-atelier:wishlist に商品 handle を保存（最新を先頭・重複排除・上限あり）。
 * - <wishlist-toggle>: カード／PDP のトグル。クリックで追加・削除し、document に 'wishlist:updated' を発火。
 * - <wishlist-count>: ヘッダーの件数バッジ。
 * - <wishlist-products>: 一覧ホスト。記録済み handle のカードを Section Rendering API で取得して表示。
 *   空なら空状態を表示。他所でトグルされた変更（'wishlist:updated'）にも追従し、削除分はその場で消す。
 * - すべてのインスタンスは 'wishlist:updated' を購読して localStorage を単一の真実として再同期する。
 */
const WISHLIST_KEY = 'sweet-atelier:wishlist';
const WISHLIST_MAX = 50;
const WISHLIST_EVENT = 'wishlist:updated';

function readWishlist() {
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((handle) => typeof handle === 'string' && handle) : [];
  } catch (e) {
    return [];
  }
}

function writeWishlist(handles) {
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(handles.slice(0, WISHLIST_MAX)));
  } catch (e) {
    /* localStorage が使えない場合は何もしない */
  }
}

function isInWishlist(handle) {
  return readWishlist().indexOf(handle) !== -1;
}

function toggleWishlist(handle) {
  const current = readWishlist();
  const handles = current.filter((stored) => stored !== handle);
  const added = handles.length === current.length;
  if (added) handles.unshift(handle);
  writeWishlist(handles);
  document.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { handles, handle, added } }));
  return added;
}

class WishlistToggle extends HTMLElement {
  connectedCallback() {
    this.handle = this.dataset.productHandle;
    this.button = this.querySelector('button');
    this.textEl = this.querySelector('.wishlist-toggle__text');
    if (!this.handle || !this.button || this.bound) return;
    this.bound = true;

    this.onClick = () => {
      toggleWishlist(this.handle);
    };
    this.onUpdated = () => this.sync();
    this.button.addEventListener('click', this.onClick);
    document.addEventListener(WISHLIST_EVENT, this.onUpdated);
    this.sync();
  }

  disconnectedCallback() {
    document.removeEventListener(WISHLIST_EVENT, this.onUpdated);
  }

  sync() {
    const active = isInWishlist(this.handle);
    const label = active ? this.dataset.labelRemove : this.dataset.labelAdd;
    this.button.setAttribute('aria-pressed', active ? 'true' : 'false');
    this.button.setAttribute('aria-label', label);
    if (this.textEl) this.textEl.textContent = label;
  }
}

class WishlistCount extends HTMLElement {
  connectedCallback() {
    this.count = this.querySelector('[aria-hidden]');
    this.srText = this.querySelector('.visually-hidden');
    this.onUpdated = () => this.sync();
    document.addEventListener(WISHLIST_EVENT, this.onUpdated);
    this.sync();
  }

  disconnectedCallback() {
    document.removeEventListener(WISHLIST_EVENT, this.onUpdated);
  }

  sync() {
    const total = readWishlist().length;
    this.hidden = total === 0;
    if (this.count) this.count.textContent = total < 100 ? String(total) : '99+';
    if (this.srText) this.srText.textContent = `お気に入り ${total} 件`;
  }
}

class WishlistProducts extends HTMLElement {
  connectedCallback() {
    this.rootUrl = this.dataset.rootUrl || '/';
    this.sectionId = this.dataset.sectionId;
    this.list = this.querySelector('[data-wishlist-grid]');
    this.empty = this.querySelector('[data-wishlist-empty]');
    this.onUpdated = (event) => this.handleUpdate(event);
    document.addEventListener(WISHLIST_EVENT, this.onUpdated);
    this.renderAll();
  }

  disconnectedCallback() {
    document.removeEventListener(WISHLIST_EVENT, this.onUpdated);
  }

  showEmpty() {
    if (this.empty) this.empty.hidden = false;
    if (this.list) this.list.hidden = true;
  }

  showGrid() {
    if (this.empty) this.empty.hidden = true;
    if (this.list) this.list.hidden = false;
  }

  renderAll() {
    const handles = readWishlist();
    if (!handles.length || !this.list) {
      this.showEmpty();
      return;
    }
    Promise.all(handles.map((handle) => this.fetchCard(handle))).then((cards) => {
      this.list.innerHTML = '';
      cards.forEach((card, index) => {
        if (!card) return;
        card.dataset.wishlistHandle = handles[index];
        this.list.appendChild(card);
      });
      if (this.list.children.length) {
        this.showGrid();
      } else {
        this.showEmpty();
      }
    });
  }

  // 他所での追加・削除に追従。一覧ページでは削除カードをその場で消す。
  handleUpdate(event) {
    const detail = event.detail || {};
    if (!this.list) return;
    if (detail.added === false && detail.handle) {
      const card = this.list.querySelector(`[data-wishlist-handle="${CSS.escape(detail.handle)}"]`);
      if (card) card.remove();
      if (!this.list.children.length) this.showEmpty();
      return;
    }
    // 追加など他の変更はフル再描画
    this.renderAll();
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

customElements.define('wishlist-toggle', WishlistToggle);
customElements.define('wishlist-count', WishlistCount);
customElements.define('wishlist-products', WishlistProducts);
