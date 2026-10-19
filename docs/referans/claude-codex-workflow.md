# Claude (Planlayıcı) + Codex (Coder) Çalışma Düzeni

## 0. Bu dosyayı Claude'a verip kurdurma

Bu dosyayı `~/projeler/` altına koy, terminalde `cd ~/projeler && claude` de ve şunu yaz:

```
claude-codex-workflow.md dosyasını oku. Aşağıdaki "Claude'a kurulum talimatı" bölümünü uygula: bana soruları sor, cevaplarıma göre proje klasörünü ve tüm dosyaları oluştur.
```

### Claude'a kurulum talimatı

Sen bu dosyayı okuyan Claude Code'sun. Hiçbir şey oluşturmadan önce kullanıcıya şu soruları sor (tek seferde, numaralı):

1. Proje adı? (klasör adı olacak, küçük harf, boşluksuz)
2. Projenin 1-2 cümlelik hedefi?
3. Frontend teknolojisi? (ör. Next.js, React+Vite, yok)
4. Backend teknolojisi? (ör. Node/Express, Laravel, Django, Supabase, yok)
5. Veritabanı? (Postgres, MySQL, Supabase, SQLite, yok)
6. Test aracı? (Vitest, Jest, Pytest, PHPUnit, bilmiyorum → sen seç)
7. ECC kurulu mu? Claude için `/plugin list ecc@ecc`, Codex için `codex plugin list` ile kontrol et; kurulu değilse kurulum komutunu kullanıcıya göster ve onay iste.
8. 21st MCP için API key var mı? (Claude tarafı `.mcp.json`'a yazılacak; Codex'te zaten ekli)
9. find-skills global mi proje bazlı mı kurulsun?
10. İşletim sistemi? (Linux/Mac/Windows — yol ve komut farkı için)

Cevapları aldıktan sonra sırayla:

- `~/projeler/<proje-adı>` klasörünü ve bölüm 2'deki iskeleti oluştur (`git init` dahil).
- Bölüm 3'teki `CLAUDE.md`, bölüm 4'teki `AGENTS.md`, bölüm 5'teki `.claude/commands/build.md` dosyalarını birebir yaz.
- Bölüm 6'daki `docs/PLAN.md` şablonunu kullanıcının cevaplarıyla doldur (teknoloji, hedef, frontend/backend sınırı).
- Bölüm 1.3'teki `.mcp.json`'ı API key ile yaz (key yoksa placeholder bırak ve söyle).
- ECC rule paketlerini stack'e göre `.claude/rules/ecc/` altına kopyala (bölüm 1.2).
- find-skills'i kur (bölüm 1.4).
- `.gitignore` oluştur (`.env`, `node_modules`, `.mcp.json` içinde key varsa onu da).
- İlk commit: `git add -A && git commit -m "chore: proje iskeleti"`.
- Bitince kullanıcıya oluşturulan dosyaların listesini ve "şimdi `cd ~/projeler/<proje-adı> && claude` deyip ilk isteğini yazabilirsin" mesajını ver.

Bu bölümün dışındaki her şey referans; kurulum tamamlanınca bu dosyanın kendisini proje klasörüne kopyalama, `~/projeler/` altında kalsın.

---

Claude Code plan ve `.md` dosyalarını yazar, Codex CLI kodu uygular. Sen sadece Claude ile konuşursun; Codex arka planda Claude'un çalıştırdığı bir komut olarak koşar.

Üstüne üç eklenti:
- **ECC** (Everything Claude Code) — her iki ajana 71 agent, 311 skill (frontend-patterns, backend-patterns, tdd-workflow, security-review...), hook ve rule verir.
- **21st MCP** (eski adıyla Magic MCP) — frontend UI component üretimi; Codex'in coder tarafında kullanılır.
- **find-skills** — ajan ihtiyaç duyduğu skill'i `skills.sh` kataloğundan kendisi bulup kurar.

---

## 1. Kurulum (bir kez)

### 1.1 Temel araçlar

```bash
# Node 18+, Git şart
node --version && git --version

# Claude Code
npm i -g @anthropic-ai/claude-code
claude          # ilk açılışta login

# Codex CLI
npm i -g @openai/codex
codex login

# Proje klasörü: ~/projeler/<proje-adı>  (tüm dosyalar burada)
mkdir -p ~/projeler/<proje-adı>
cd ~/projeler/<proje-adı>
git init            # Codex git repo şart koşar
mkdir -p docs/tasks src/frontend src/backend .claude/commands .claude/rules .claude/skills .agents/skills
```

Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\projeler\<proje-adı>"
cd "$env:USERPROFILE\projeler\<proje-adı>"
git init
```

Tüm projeler `~/projeler/` altında ayrı klasörde durur; `CLAUDE.md`, `AGENTS.md`, `docs/`, `src/` hepsi o proje klasörünün kökündedir. Global kurulan şeyler (ECC user scope, find-skills `-g`) `~/.claude/` ve `~/.codex/` altına gider, proje klasörüne değil.

### 1.2 ECC — her iki harness'e tek seferde

```bash
# Guided wizard: Claude + Codex ikisini birden seçersin
npx ecc-universal@2.2.3 install --guided
```

Wizard'da **Claude Code** ve **Codex**'i işaretle. Claude için scope = `project` (bu repoya özel) veya `user` (global), hooks = `standard`.

Otomasyon için tek satır:

```bash
npx ecc-universal@2.2.3 install --guided \
  --harness claude --harness codex \
  --claude-scope project --claude-hooks standard \
  --profile core --yes
```

Alternatif (ayrı ayrı):

```bash
# Claude Code içinde:
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

# Codex CLI içinde:
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc
```

> **Tek yol seç.** Plugin kurduysan üstüne manuel `install.sh --profile full` çalıştırma; iki kez kurmak skill/hook'ları çiftler.

Rule paketleri plugin ile gelmez, elle kopyalanır (sadece kullandığın stack):

```bash
git clone https://github.com/affaan-m/ECC.git /tmp/ECC
mkdir -p .claude/rules/ecc
cp -R /tmp/ECC/rules/common .claude/rules/ecc/
cp -R /tmp/ECC/rules/typescript .claude/rules/ecc/   # stack'ine göre: python, php, golang...
```

Doğrulama:

```bash
claude                 # içinde: /plugin list ecc@ecc
codex plugin list --json
```

### 1.3 21st MCP — frontend component üretimi

API key: https://21.dev/mcp (veya 21st.dev/magic). Sonra her iki harness'e kur:

```bash
npx @21st-dev/cli@latest init --client claude
# Codex'te zaten ekli — tekrar çalıştırma
```

Manuel kurmak istersen proje köküne `.mcp.json` (Claude okur):

```json
{
  "mcpServers": {
    "21st": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": { "API_KEY": "21ST_API_KEYIN" }
    }
  }
}
```

Codex tarafında 21st MCP `~/.codex/config.toml` içinde zaten ekli; yeniden kurma. Kontrol: `codex mcp list` (yoksa `codex --help` ile MCP komutuna bak).

Kurulumdan sonra CLI'ları yeniden başlat. Codex'te MCP araçları `21st` adıyla görünür; task'larda "21st MCP ile component üret" diyerek kullandırırsın.

### 1.4 find-skills — ajan kendi skill'ini bulsun

```bash
# Proje köküne (hem Claude hem Codex .agents/skills/ ve .claude/skills/ okur)
npx skills add https://github.com/vercel-labs/skills --skill find-skills

# Global istersen:
npx skills add https://github.com/vercel-labs/skills --skill find-skills -g -y
```

Kullanım: ajan "React form validation için skill var mı?" sorusunda `npx skills find react form` koşturur, bulduğunu `npx skills add <owner/repo@skill>` ile kurar. Diğer komutlar: `npx skills check`, `npx skills update`.

---

## 2. Repo yapısı

```
~/projeler/
└── <proje-adı>/
    ├── CLAUDE.md                 ← Claude'un rolü (planlayıcı)
    ├── AGENTS.md                 ← Codex'in rolü (coder)
    ├── .mcp.json                 ← 21st MCP (Claude tarafı)
    ├── .claude/
    │   ├── commands/
    │   │   └── build.md          ← /build slash komutu
    │   ├── rules/ecc/            ← ECC rule paketleri
    │   └── skills/               ← find-skills + kurulan skill'ler
    ├── .agents/skills/           ← Codex'in okuduğu skill dizini
    ├── docs/
    │   ├── PLAN.md               ← Claude yazar: mimari, kararlar
    │   └── tasks/
    │       ├── 001-ornek.md      ← Claude yazar: tek iş
    │       └── ...
    └── src/
        ├── frontend/             ← Codex yazar (21st MCP + frontend-patterns)
        └── backend/              ← Codex yazar (backend-patterns + api-design)
```

Her yeni proje = `~/projeler/` altında yeni bir klasör, aynı iskelet.

---

## 3. `CLAUDE.md` (repo kökü)

```markdown
# Rol: Mimar / Planlayıcı

Çalışma dizini: bu repo'nun kökü (`~/projeler/<proje-adı>`). Tüm dosyalar buradadır; dışarıya yazma.

Bu projede sen KOD YAZMAZSIN. `src/` altına dosya oluşturma veya düzenleme — bunu Codex yapar.

## Araçların

- ECC: planlama için `/ecc:plan`, mimari için `architect` agent'ı, review için `/code-review` ve `security-review` skill'i.
- find-skills: task yazarken "bu iş için hazır skill var mı?" diye `npx skills find <konu>` ile bak; varsa task dosyasına "kullanılacak skill" olarak yaz.
- 21st MCP sende de kurulu ama sen component üretme; task'ta Codex'e "21st MCP ile üret" talimatı ver.

## Görevin

1. Kullanıcının isteğini analiz et, gerekirse 1-2 soru sor.
2. `/ecc:plan "<istek>"` ile taslak plan çıkar, `docs/PLAN.md` dosyasına işle: hedef, mimari kararlar, kütüphaneler, klasör yapısı, frontend/backend sınırı.
3. İşi parçalara böl. Her parça için `docs/tasks/NNN-isim.md` oluştur (NNN = sıralı numara). Frontend ve backend task'larını ayır; birbirine bağımlıysa `addBlockedBy` mantığıyla sıraya koy.
4. Her task için ilgili ECC skill'ini ve gerekiyorsa 21st MCP'yi task dosyasına yaz.
5. Task hazır olunca kullanıcıya özetle ve onay iste.
6. Onay gelince Codex'i çalıştır:
   codex exec --full-auto "docs/tasks/NNN-isim.md dosyasını AGENTS.md kurallarına göre uygula. Bitince task dosyasına '## Durum: TAMAMLANDI' ekle."
7. Codex bitince `/code-review` ile (taze context) `git diff HEAD~1`'i task'taki kabul kriterlerine göre denetle. Güvenlik dokunan task'larda ek olarak `security-review` skill'ini çalıştır.
   - Hepsi tamamsa: kullanıcıya "NNN tamamlandı" de ve sıradaki task'a geç.
   - Eksik varsa: task dosyasına `## Düzeltme NNN-x` bölümü ekle ve:
     codex exec --full-auto resume --last "docs/tasks/NNN-isim.md içindeki Düzeltme bölümünü uygula."
   - 3 denemede düzelmezse kullanıcıya rapor et, kendin düzeltmeye kalkma.

## Task dosyası şablonu

# Task NNN: <isim>

## Tür
frontend | backend | fullstack

## Amaç
1-2 cümle.

## Bağlam
İlgili PLAN.md bölümü, dokunulacak mevcut dosyalar, bağımlı task'lar.

## Kullanılacak araçlar
- ECC skill: frontend-patterns / backend-patterns / api-design / tdd-workflow ...
- 21st MCP: evet/hayır (evetse hangi component'ler)
- find-skills ile bulunup kurulacak ek skill: ...

## Dokunulacak dosyalar
- src/... (oluştur / düzenle)

## Adımlar
1. ...

## Kabul kriterleri
- [ ] Test edilebilir, somut madde (komutla doğrulanabilir)
- [ ] ...

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma
- ...

## Durum: BEKLİYOR

## Kurallar
- Her task tek sorumluluk taşır, 1 oturumda bitecek boyutta olmalı.
- Kabul kriterleri komutla doğrulanabilir olmalı (test, build, curl vb.).
- PLAN.md ile çelişen task yazma; plan değişecekse önce PLAN.md'yi güncelle.
- ECC rule'ları (`.claude/rules/ecc/`) her zaman geçerli.
```

---

## 4. `AGENTS.md` (repo kökü)

```markdown
# Rol: Coder

Çalışma dizini: bu repo'nun kökü (`~/projeler/<proje-adı>`). Repo dışına dosya yazma.

Sen uygulayıcısın. Planı Claude yazar, sen kodlarsın.

## Araçların

- ECC skill'leri: task dosyasında hangisi yazıyorsa onu kullan. Yazmıyorsa varsayılan:
  - frontend task → `frontend-patterns` + `tdd-workflow`
  - backend task → `backend-patterns` + `api-design` + `tdd-workflow`
  - veritabanı dokunuyorsa → `database-migrations` + `postgres-patterns`
- 21st MCP: UI component gerekiyorsa önce 21st MCP ile ara/üret, sıfırdan yazma. Üretilen component'i projenin stil sistemine uyarla.
- find-skills: task'ta "ek skill: ..." varsa `npx skills add <paket>` ile kur. Yoksa ve bilmediğin bir konuyla karşılaşırsan `npx skills find <konu>` ile bak; kurduğun skill'i `## Coder Notu`'na yaz.

## Her görevde sırayla

1. `docs/PLAN.md` dosyasını oku.
2. Sana verilen `docs/tasks/NNN-*.md` dosyasını oku.
3. "Kullanılacak araçlar" bölümündeki skill'leri yükle, gerekiyorsa find-skills ile ek skill kur.
4. TDD: önce başarısız test yaz (RED), sonra kodu yaz (GREEN), sonra düzenle.
5. Adımları ve kabul kriterlerini birebir uygula.
6. Kabul kriterlerindeki her maddeyi çalıştırıp doğrula (test, build, lint).
7. Commit:
   git add -A && git commit -m "task NNN: <isim>"
8. Task dosyasının sonundaki `## Durum:` satırını `## Durum: TAMAMLANDI` yap.

## Kurallar

- Plan veya mimari kararlarını değiştirme.
- Task dışına çıkma; "bunu da iyileştireyim" yapma.
- `docs/` altındaki dosyaları değiştirme — tek istisna: task dosyasına `## Coder Notu` ve `## Durum` eklemek.
- Bir adım uygulanamıyorsa veya planda hata görüyorsan: yapabildiğin kadarını yap, task dosyasına `## Coder Notu` başlığıyla sorunu yaz, commit'le ve bitir. Planı kendin düzeltme.
- Frontend task'ında backend'e, backend task'ında frontend'e dokunma (fullstack değilse).
- Mevcut kod stiline ve klasör yapısına uy. ECC rule'ları geçerli.
- Gizli bilgileri (API key, şifre) koda gömme; `.env` kullan.
```

---

## 5. `.claude/commands/build.md`

```markdown
Task numarası: $ARGUMENTS

1. `docs/tasks/$ARGUMENTS-*.md` dosyasını bul ve oku.
2. Şu komutu çalıştır:
   codex exec --full-auto "docs/tasks/$ARGUMENTS-*.md dosyasını AGENTS.md kurallarına göre uygula. Bitince task dosyasına '## Durum: TAMAMLANDI' ekle."
3. Bitince `/code-review` ile `git diff HEAD~1` al, kabul kriterlerinin her birini tek tek kontrol et.
4. Task "Tür: backend" veya auth/ödeme dokunuyorsa `security-review` skill'ini de çalıştır.
5. Sonucu tablo olarak raporla: kriter | durum | not.
6. Eksik varsa task dosyasına `## Düzeltme` bölümü ekle ve bana sor: tekrar Codex'e vereyim mi?
```

Kullanım: Claude Code içinde `/build 001`

---

## 6. `docs/PLAN.md` başlangıç şablonu

```markdown
# Proje Planı

## Hedef
...

## Teknoloji
- Frontend:
- Backend:
- Veritabanı:
- Test:

## Frontend / Backend sınırı
- API sözleşmesi nerede tanımlı (ör. docs/api.md veya OpenAPI):
- Frontend backend'e nasıl bağlanır:

## Klasör yapısı
...

## Mimari kararlar
| # | Karar | Gerekçe | Tarih |
|---|-------|---------|-------|

## Task listesi
| No | İsim | Tür | Bağımlı | Durum |
|----|------|-----|---------|-------|
```

---

## 7. Günlük akış

```
cd ~/projeler/<proje-adı>
claude
```

```
> Kullanıcı girişi ekle, e-posta + şifre, JWT ile; login sayfası da olsun
```

1. Claude `/ecc:plan` ile taslak çıkarır, `PLAN.md`'yi günceller, iki task yazar:
   - `001-auth-backend.md` (backend-patterns, api-design, tdd-workflow)
   - `002-login-page.md` (frontend-patterns, 21st MCP: evet — login form, bağımlı: 001)
2. Onay ister. Sen "evet" dersin (ya da `/build 001`).
3. Claude Bash ile `codex exec --full-auto ...` çalıştırır. Codex `AGENTS.md`'yi okur, skill'leri yükler, TDD ile backend'i yazar, commit'ler, kapanır.
4. Claude `/code-review` + `security-review` ile denetler, rapor verir.
5. `/build 002` → Codex 21st MCP ile login form component'ini üretir, API'ye bağlar, test eder, commit'ler.
6. Claude review, rapor. Sonraki istek.

```
Sen ──istek──▶ Claude (ECC plan + task md'leri)
                  │
                  └──codex exec──▶ Codex (ECC skill + 21st MCP + find-skills ile kod, commit)
                  ◀──git diff─────┘
               Claude /code-review ──▶ sana rapor
```

---

## 8. Notlar

- `--full-auto` = workspace-write sandbox + on-request onay. Dosya düzenler, ağ erişimi kısıtlı. `npm install`, 21st MCP çağrısı gibi ağa çıkan işler gerekiyorsa `--sandbox danger-full-access` ekle; sadece güvendiğin repoda.
- Codex çıktısını dosyaya almak: `codex exec --output-last-message docs/last-codex.md ...` — Claude bunu okur.
- Önceki Codex oturumuna devam: `codex exec resume --last "..."`
- Roller kesin ayrı: Claude → `docs/`, Codex → `src/`. İkisi aynı dosyaya dokunmaz.
- Git şart: her task ayrı commit, geri alma kolay.
- ECC plugin tek kurulum: plugin + manuel install üst üste yapma. Sorun olursa `npx ecc-universal@2.2.3 doctor` ve `repair`.
- ECC güncelleme: `npx ecc-universal@2.2.3 setup` (Claude), `codex plugin marketplace upgrade ecc && codex plugin add ecc@ecc` (Codex).
- 21st MCP API key'i `.env` veya config'de tut, commit'leme. Codex 0.13x'te plugin `.mcp.json` içinde `${VAR}` çözülmüyor; config.toml'a düz değer yaz.
- Komut/flag isimleri değişebilir; emin olmak için `codex exec --help`, `npx skills --help`.

## Kaynaklar

- ECC: https://github.com/affaan-m/ECC
- 21st MCP: https://github.com/21st-dev/magic-mcp — key: https://21.dev/mcp
- find-skills: https://skills.sh/ — `npx skills add https://github.com/vercel-labs/skills --skill find-skills`
- Codex exec: `codex exec --help`
