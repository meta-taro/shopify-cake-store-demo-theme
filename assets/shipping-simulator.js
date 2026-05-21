/*
 * 送料シミュレーター（Phase 9c）
 *
 * - 都道府県を選ぶと配送地域区分（本州 / 北海道・四国・九州 / 沖縄）に応じた送料を表示。
 * - 任意のご注文金額を入力すると、無料配送のしきい値（既定 ¥10,000・沖縄を除く）を判定。
 * - 選択した都道府県は localStorage キー sweet-atelier:shipping-pref に保存し、次回そのまま復元。
 * - 料金・しきい値は data-* 属性（セクション設定）から読み込むため、コードを触らず調整できる。
 * - フロントエンドのみ（Shopify 設定・アプリ不要）。実際の送料は確定ではない旨を併記する。
 */
(function () {
  if (customElements.get('shipping-simulator')) return;

  const PREF_KEY = 'sweet-atelier:shipping-pref';

  // 地域内では送料区分が一律なので、地域ごとに tier を割り当てる。
  // honshu=本州 / kotetsu=北海道・四国・九州 / okinawa=沖縄。合計 47 都道府県。
  const REGIONS = [
    { label: '北海道', tier: 'kotetsu', prefs: ['北海道'] },
    { label: '東北', tier: 'honshu', prefs: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
    { label: '関東', tier: 'honshu', prefs: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
    { label: '中部', tier: 'honshu', prefs: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
    { label: '近畿', tier: 'honshu', prefs: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
    { label: '中国', tier: 'honshu', prefs: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
    { label: '四国', tier: 'kotetsu', prefs: ['徳島県', '香川県', '愛媛県', '高知県'] },
    { label: '九州', tier: 'kotetsu', prefs: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'] },
    { label: '沖縄', tier: 'okinawa', prefs: ['沖縄県'] },
  ];

  const TIER_LABEL = { honshu: '本州', kotetsu: '北海道・四国・九州', okinawa: '沖縄' };

  function yen(value) {
    return '¥' + Number(value).toLocaleString('ja-JP');
  }

  class ShippingSimulator extends HTMLElement {
    connectedCallback() {
      this.select = this.querySelector('[data-pref-select]');
      this.amount = this.querySelector('[data-amount-input]');
      this.result = this.querySelector('[data-result]');
      if (!this.select || !this.result) return;

      this.fees = {
        honshu: parseInt(this.dataset.feeHonshu, 10) || 0,
        kotetsu: parseInt(this.dataset.feeKotetsu, 10) || 0,
        okinawa: parseInt(this.dataset.feeOkinawa, 10) || 0,
      };
      this.freeThreshold = parseInt(this.dataset.freeThreshold, 10) || 0;
      this.tierByPref = {};

      this.buildOptions();
      this.restore();

      this.select.addEventListener('change', () => {
        this.persist();
        this.render();
      });
      if (this.amount) this.amount.addEventListener('input', () => this.render());
      this.render();
    }

    buildOptions() {
      // プレースホルダーの option はセクション側（Liquid）に既にあるため、ここでは追加しない。
      const frag = document.createDocumentFragment();
      REGIONS.forEach((region) => {
        const group = document.createElement('optgroup');
        group.label = region.label;
        region.prefs.forEach((pref) => {
          this.tierByPref[pref] = region.tier;
          const opt = document.createElement('option');
          opt.value = pref;
          opt.textContent = pref;
          group.appendChild(opt);
        });
        frag.appendChild(group);
      });
      this.select.appendChild(frag);
    }

    restore() {
      try {
        const saved = window.localStorage.getItem(PREF_KEY);
        if (saved && this.tierByPref[saved]) this.select.value = saved;
      } catch (e) {
        /* localStorage が使えない場合は何もしない */
      }
    }

    persist() {
      try {
        window.localStorage.setItem(PREF_KEY, this.select.value);
      } catch (e) {
        /* 何もしない */
      }
    }

    render() {
      const pref = this.select.value;
      if (!pref) {
        this.result.innerHTML = '<p class="shipping-simulator__hint">都道府県を選ぶと、お届け先の送料の目安を表示します。</p>';
        return;
      }
      const tier = this.tierByPref[pref];
      const base = this.fees[tier];
      const amount = this.amount ? parseInt(this.amount.value, 10) : NaN;
      const hasAmount = !Number.isNaN(amount) && amount > 0;
      const freeEligible = hasAmount && amount >= this.freeThreshold && tier !== 'okinawa';

      const parts = [];
      parts.push(`<p class="shipping-simulator__region">配送区分: <strong>${TIER_LABEL[tier]}</strong></p>`);
      if (freeEligible) {
        parts.push(`<p class="shipping-simulator__fee shipping-simulator__fee--free">送料無料 <span>(${yen(base)} → ${yen(0)})</span></p>`);
        parts.push(`<p class="shipping-simulator__note">${yen(this.freeThreshold)} 以上のご注文のため送料無料です。</p>`);
      } else {
        parts.push(`<p class="shipping-simulator__fee">${pref} への送料 <strong>${yen(base)}</strong></p>`);
        if (tier === 'okinawa') {
          parts.push('<p class="shipping-simulator__note">沖縄県は送料無料の対象外です。</p>');
        } else if (hasAmount) {
          const remain = this.freeThreshold - amount;
          parts.push(`<p class="shipping-simulator__note">あと ${yen(remain)} のご購入で送料無料になります。</p>`);
        } else {
          parts.push(`<p class="shipping-simulator__note">${yen(this.freeThreshold)} 以上のご注文で送料無料(沖縄を除く)。</p>`);
        }
      }
      parts.push('<p class="shipping-simulator__disclaimer">※ 表示は目安です。確定送料は購入手続き画面でご確認ください。</p>');
      this.result.innerHTML = parts.join('');
    }
  }

  customElements.define('shipping-simulator', ShippingSimulator);
})();
