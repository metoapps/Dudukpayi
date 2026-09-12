# Düdük Payı

Hakem kararları düzeltilseydi Süper Lig puan tablosu ne olurdu?

Canlı: https://metoapps.github.io/Dudukpayi/

`index.html` kabuktur; uygulama `app.p1.js`–`app.p4.js` olarak yüklenir ve birleşir.

## Model

- Skor kararları: geç dakika kesikli skor, erken dakika kalan süre Poisson. Aynı karar iki kez yazılmaz; beklenen xG korunur.
- Verilmeyen penaltı xG = 0,76. Kırmızı, kalan süre ve ev/deplasman tabanı (1,45 / 1,20) üzerinde 0,65 / 0,35 kaymasıdır.
- Üst bant: `min(1, kesinlik/100 + 0,20)` — spekülatif karar %100 sayılmaz.
- Sıralama TFF: puan → (ikili seri tamamsa) kendi araları → genel düzeltilmiş averaj → atılan gol.
- Düzeltilmiş eşitlikte ham averaj değil, kararların beklenen gol kayması kullanılır.
