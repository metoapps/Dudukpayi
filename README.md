# Düdük Payı

Hakem kararları düzeltilseydi Süper Lig puan tablosu ne olurdu?

Canlı: https://metoapps.github.io/Dudukpayi/

## Dosyalar

- `index.html` — kabuk (stil + betik parçalarını yükler)
- `style.1.css`, `style.2.css`
- `app.1.js` … `app.9.js` — uygulama; yüklenince birleşir
- `og-kart.png`

GitHub tek commit'te büyük tek dosyayı kabul etmediği için bölündü.

## Model

- Skor kararları: geç dakika kesikli skor, erken dakika kalan süre Poisson. Aynı karar iki kez yazılmaz; beklenen xG korunur.
- Verilmeyen penaltı xG = 0,76. Kırmızı, kalan süre × ev/deplasman tabanı (1,45 / 1,20) üzerinde 0,65 / 0,35.
- Üst bant: `min(1, kesinlik/100 + 0,20)`.
- Sıralama TFF: puan → (ikili seri tamamsa) kendi araları → genel düzeltilmiş averaj → atılan gol.
- Boş npoint kutusuna örnek sezon yazılmaz.
