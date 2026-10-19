Task numarası: $ARGUMENTS

1. `docs/tasks/$ARGUMENTS-*.md` dosyasını bul ve oku.
2. Şu komutu çalıştır:
   codex exec --approve-for-me "docs/tasks/$ARGUMENTS-*.md dosyasını AGENTS.md kurallarına göre uygula. Bitince task dosyasına '## Durum: TAMAMLANDI' ekle."
3. Bitince `/code-review` ile `git diff HEAD~1` al, kabul kriterlerinin her birini tek tek kontrol et.
4. Task "Tür: backend" veya auth/ödeme dokunuyorsa `security-review` skill'ini de çalıştır.
5. Sonucu tablo olarak raporla: kriter | durum | not.
6. Eksik varsa task dosyasına `## Düzeltme` bölümü ekle ve bana sor: tekrar Codex'e vereyim mi?
