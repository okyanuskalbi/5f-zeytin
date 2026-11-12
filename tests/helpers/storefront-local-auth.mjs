import { randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import assert from 'node:assert/strict';

// Local evidence servers differ by task; qa-design-v3-pages sets its own address before importing this.
const origin = /^https:\/\/localhost:\d+$/.test(process.env.STOREFRONT_QA_ORIGIN ?? '') ? process.env.STOREFRONT_QA_ORIGIN : 'https://localhost:3021';
function localPool() {
  const raw = process.env.TEST_DATABASE_URL;
  if (!raw) throw new Error('Local TEST_DATABASE_URL required');
  const u = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(u.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) || u.pathname !== '/afina_kontrol189' || [...u.searchParams.keys()].some(key => !['application_name', 'sslmode'].includes(key))) throw new Error('Only afina_kontrol189 localhost allowed');
  return new pg.Pool({ connectionString: raw, max: 1 });
}
async function mutation(page, path, method, action, status) {
  const result = page.waitForResponse(r => new URL(r.url()).pathname === path && r.request().method() === method);
  await action();
  const response = await result;
  assert.equal(response.status(), status, `${method} ${path} status`);
}
async function login(page, email, password) {
  await page.goto(`${origin}/giris`, { waitUntil: 'networkidle' });
  await page.getByLabel('E-posta', { exact: true }).fill(email);
  await page.getByLabel('Şifre', { exact: true }).fill(password);
  await mutation(page, '/api/auth/login', 'POST', () => page.getByRole('button', { name: 'E-posta ile giriş yap', exact: true }).click(), 200);
  await page.waitForURL(`${origin}/hesabim`);
  await page.getByRole('heading', { name: 'Hesabım', exact: true }).waitFor();
}

/** A real UI registration/login against the isolated local DB. No credentials or
 * session cookies are written to disk. The caller MUST invoke cleanup in finally. */
export async function prepareSession(browser, { exercise = true } = {}) {
  const pool = localPool();
  const suffix = randomUUID().replaceAll('-', '').slice(0, 14);
  const email = `task199-${suffix}@example.test`;
  let password = `LocalA9!${randomBytes(16).toString('hex')}`;
  const orderNo = `QA199-${suffix}`;
  let userId;
  let closed = false;
  const checks = [];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, ignoreHTTPSErrors: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  async function cleanup() {
    if (closed) return;
    closed = true;
    await context.close().catch(() => {});
    try {
      const result = await pool.query('SELECT id FROM public."user" WHERE email=$1', [email]);
      const ownedId = userId ?? result.rows[0]?.id;
      if (ownedId) {
        await pool.query('DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id=$1)', [ownedId]);
        await pool.query('DELETE FROM public.orders WHERE user_id=$1', [ownedId]);
        await pool.query('DELETE FROM public."user" WHERE id=$1 AND email=$2', [ownedId, email]);
      }
      const remaining = await pool.query('SELECT count(*)::int AS count FROM public."user" WHERE email=$1', [email]);
      assert.equal(remaining.rows[0].count, 0, 'owned local test user removed');
    } finally { await pool.end(); }
  }
  try {
    const target = await pool.query('select current_database() AS name');
    assert.equal(target.rows[0].name, 'afina_kontrol189');
    await page.goto(`${origin}/kayit`, { waitUntil: 'networkidle' });
    await page.getByLabel('Ad soyad', { exact: true }).fill('Yerel Denetim');
    await page.getByLabel('E-posta', { exact: true }).fill(email);
    await page.getByLabel('Şifre', { exact: true }).fill(password);
    await page.locator('input[name="privacy"]').check();
    await page.locator('input[name="consent"]').check();
    await mutation(page, '/api/auth/register', 'POST', () => page.getByRole('button', { name: 'Üyelik oluştur', exact: true }).click(), 202);
    await page.getByText('Hesabınız hazır. Şifrenizle giriş yapabilirsiniz.', { exact: true }).waitFor();
    const result = await pool.query('SELECT id FROM public."user" WHERE email=$1', [email]);
    assert.equal(result.rowCount, 1, 'UI registration persisted one local user');
    userId = result.rows[0].id;
    checks.push('registration-ui-and-local-db');
    await login(page, email, password);
    checks.push('password-login-ui');

    if (exercise) {
      await page.goto(`${origin}/hesabim/adresler`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Adres ekle', exact: true }).click();
      const form = page.getByRole('form', { name: 'Adres bilgileri' });
      const values = {'Adres başlığı':'Yerel denetim adresi', Alıcı:'Yerel Denetim', Telefon:'05321234567', İl:'Osmaniye', İlçe:'Düziçi', 'Açık adres':'Yerel test adresi, örnek sokak 1', 'Posta kodu':'80600'};
      for (const [label, value] of Object.entries(values)) await form.getByLabel(label, { exact: true }).fill(value);
      await mutation(page, '/api/account/addresses', 'POST', () => form.getByRole('button', { name: 'Adresi kaydet', exact: true }).click(), 201);
      await page.getByRole('heading', { name: 'Yerel denetim adresi', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Düzenle', exact: true }).click();
      await page.getByLabel('Adres başlığı', { exact: true }).fill('Güncellenen yerel adres');
      await mutation(page, '/api/account/addresses', 'PATCH', () => page.getByRole('button', { name: 'Adresi kaydet', exact: true }).click(), 200);
      await page.getByRole('heading', { name: 'Güncellenen yerel adres', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Sil', exact: true }).click();
      await mutation(page, '/api/account/addresses', 'DELETE', () => page.getByRole('alertdialog').getByRole('button', { name: 'Adresi sil', exact: true }).click(), 204);
      await page.getByText('Henüz adresiniz yok.', { exact: true }).waitFor();
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM public.customer_addresses WHERE user_id=$1', [userId])).rows[0].count, 0);
      checks.push('address-create-edit-delete-ui-and-local-db');

      await page.goto(`${origin}/hesabim/bilgilerim`, { waitUntil: 'networkidle' });
      await page.getByLabel('Ad soyad', { exact: true }).fill('Yerel Denetim Güncel');
      await page.getByLabel('Telefon', { exact: true }).fill('05321234567');
      await mutation(page, '/api/account/profile', 'PATCH', () => page.getByRole('button', { name: 'Bilgileri kaydet', exact: true }).click(), 200);
      await page.getByText('Hesap bilgileriniz güncellendi.', { exact: true }).waitFor();
      const profile = (await pool.query('SELECT name,phone FROM public."user" WHERE id=$1', [userId])).rows[0];
      assert.deepEqual(profile, {name:'Yerel Denetim Güncel', phone:'05321234567'});
      checks.push('profile-update-ui-and-local-db');

      await page.goto(`${origin}/hesabim/guvenlik`, { waitUntil: 'networkidle' });
      const nextPassword = `LocalB8!${randomBytes(16).toString('hex')}`;
      await page.getByLabel('Mevcut şifre', { exact: true }).fill(password);
      await page.getByLabel('Yeni şifre', { exact: true }).fill(nextPassword);
      await page.getByRole('button', {name:'Yeni şifre: göster', exact:true}).click();
      assert.equal(await page.getByLabel('Yeni şifre', {exact:true}).getAttribute('type'), 'text');
      await page.getByRole('button', {name:'Yeni şifre: gizle', exact:true}).click();
      await mutation(page, '/api/account/password', 'POST', () => page.getByRole('button', { name: 'Şifreyi güncelle', exact: true }).click(), 204);
      await page.getByText('Şifreniz güncellendi.', { exact: true }).waitFor();
      password = nextPassword;
      await mutation(page, '/auth/logout', 'POST', () => page.getByRole('button', { name: 'Çıkış yap', exact: true }).click(), 204);
      await page.waitForURL(`${origin}/giris`);
      await login(page, email, password);
      checks.push('password-show-hide-change-logout-relogin-ui');
    }
    const order = await pool.query('INSERT INTO public.orders(user_id,order_no,status,total_kurus,delivery_address) VALUES($1,$2,$3,$4,$5) RETURNING id', [userId, orderNo, 'preparing', 36000, { recipient:'Yerel Denetim', line:'Yerel test adresi', district:'Düziçi', city:'Osmaniye', postalCode:'80600' }]);
    await pool.query('INSERT INTO public.order_items(order_id,product_name,weight,quantity,unit_price_kurus) VALUES($1,$2,$3,$4,$5)', [order.rows[0].id, 'Doğal Kırma Yeşil Zeytin', '1 kg', 2, 18000]);
    // Restore one fixture address after testing deletion, for non-empty screenshots.
    await pool.query('INSERT INTO public.customer_addresses(user_id,title,recipient,phone,city,district,line,postal_code,is_default) VALUES($1,$2,$3,$4,$5,$6,$7,$8,true)', [userId,'Yerel test adresi','Yerel Denetim','05321234567','Osmaniye','Düziçi','Yerel test adresi, örnek sokak 1','80600']);
    await page.goto(`${origin}/hesabim/siparisler/${orderNo}`, { waitUntil: 'networkidle' });
    await page.getByText(orderNo, {exact:true}).waitFor();
    await page.getByText('Doğal Kırma Yeşil Zeytin', {exact:false}).waitFor();
    checks.push('owned-order-detail-read-from-local-db');
    const storageState = await context.storageState();
    await context.close();
    return { storageState, orderNo, checks, cleanup, routes: [
      ['hesabim','/hesabim'], ['hesabim-adresler','/hesabim/adresler'], ['hesabim-bilgilerim','/hesabim/bilgilerim'], ['hesabim-guvenlik','/hesabim/guvenlik'], ['hesabim-siparisler','/hesabim/siparisler'], ['hesabim-siparis-detayi',`/hesabim/siparisler/${orderNo}`],
    ]};
  } catch (error) { await cleanup(); throw error; }
}
