/* ════════════════════════════════════════
   coins.js — 花幣 & 獎勵系統（共用）
   所有頁面 <script src="coins.js"> 引入
════════════════════════════════════════ */

const Coins = {

  /* ── 取得目前花幣 ── */
  get(user) {
    return parseInt(localStorage.getItem('fl_coins_' + user) || '0', 10);
  },

  /* ── 增加花幣 ── */
  add(user, amount, reason) {
    const current = this.get(user);
    const next = current + amount;
    localStorage.setItem('fl_coins_' + user, next);
    this._logHistory(user, amount, reason);
    this._updateNavDisplay(next);
    return next;
  },

  /* ── 扣除花幣（購買用）── */
  spend(user, amount) {
    const current = this.get(user);
    if (current < amount) return false;
    const next = current - amount;
    localStorage.setItem('fl_coins_' + user, next);
    this._updateNavDisplay(next);
    return true;
  },

  /* ── 更新導覽列顯示 ── */
  _updateNavDisplay(amount) {
    const el = document.getElementById('nav-coins');
    if (el) el.textContent = amount;
  },

  /* ── 初始化導覽列（頁面載入時呼叫）── */
  initNav(user) {
    const el = document.getElementById('nav-coins');
    if (el) el.textContent = this.get(user);
  },

  /* ── 記錄花幣歷史 ── */
  _logHistory(user, amount, reason) {
    const key = 'fl_coins_history_' + user;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({
      amount,
      reason,
      date: new Date().toLocaleDateString('zh-TW'),
      ts: Date.now(),
    });
    // 只保留最近 50 筆
    if (list.length > 50) list.splice(0, list.length - 50);
    localStorage.setItem(key, JSON.stringify(list));
  },

  /* ── 今天是否已完成某任務 ── */
  doneToday(user, task) {
    const key = 'fl_task_' + user + '_' + task;
    const last = localStorage.getItem(key);
    const today = new Date().toLocaleDateString('zh-TW');
    return last === today;
  },

  /* ── 標記今天已完成某任務 ── */
  markToday(user, task) {
    const key = 'fl_task_' + user + '_' + task;
    localStorage.setItem(key, new Date().toLocaleDateString('zh-TW'));
  },

  /* ── 獎勵：寫日記（每天一次）── */
  rewardDiary(user) {
    if (this.doneToday(user, 'diary')) return 0;
    this.markToday(user, 'diary');
    return this.add(user, 10, '完成今日日記');
  },

  /* ── 獎勵：完成心情量表（每天一次）── */
  rewardMood(user) {
    if (this.doneToday(user, 'mood')) return 0;
    this.markToday(user, 'mood');
    return this.add(user, 5, '完成心情量表');
  },

  /* ── 獎勵：連續記錄天數 ── */
  rewardStreak(user) {
    const key = 'fl_streak_' + user;
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"last":""}');
    const today = new Date().toLocaleDateString('zh-TW');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-TW');

    if (data.last === today) return { streak: data.count, bonus: 0 };

    if (data.last === yesterday) {
      data.count += 1;
    } else {
      data.count = 1;
    }
    data.last = today;
    localStorage.setItem(key, JSON.stringify(data));

    let bonus = 0;
    if (data.count === 3)  { bonus = 20; this.add(user, bonus, '連續記錄 3 天！'); }
    if (data.count === 7)  { bonus = 50; this.add(user, bonus, '連續記錄 7 天！'); }
    if (data.count === 30) { bonus = 200; this.add(user, bonus, '連續記錄 30 天！'); }
    return { streak: data.count, bonus };
  },

  /* ── 取得連續天數 ── */
  getStreak(user) {
    const key = 'fl_streak_' + user;
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"last":""}');
    return data.count;
  },

};

/* ── 已購買道具工具 ── */
const Inventory = {

  get(user) {
    return JSON.parse(localStorage.getItem('fl_inventory_' + user) || '[]');
  },

  has(user, itemId) {
    return this.get(user).includes(itemId);
  },

  add(user, itemId) {
    const inv = this.get(user);
    if (!inv.includes(itemId)) {
      inv.push(itemId);
      localStorage.setItem('fl_inventory_' + user, JSON.stringify(inv));
    }
  },

  getEquipped(user, slot) {
    return localStorage.getItem('fl_equip_' + user + '_' + slot) || '';
  },

  equip(user, slot, itemId) {
    localStorage.setItem('fl_equip_' + user + '_' + slot, itemId);
  },

};