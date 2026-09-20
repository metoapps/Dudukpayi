# Düdük Payı

Hakem kararları düzeltilseydi Süper Lig puan tablosu ne olurdu?

Canlı: https://metoapps.github.io/Dudukpayi/

Tek dosya: `index.html` (HTML + CSS + JS).

## Model

- Skor kararları: geç dakika kesikli skor, erken dakika kalan süre Poisson. Aynı karar iki kez yazılmaz; beklenen xG korunur.
- Verilmeyen penaltı xG = 0,76. Kırmızı, kalan süre ve ev/deplasman tabanı üzerinde 0,65 / 0,35 kaymasıdır.
- Üst bant spekülatif kararı %100 saymaz. 90′ ve sonrası kırmızıda kalan süre 0.
- Sıralama TFF: puan → (ikili seri tamamsa) kendi araları → genel düzeltilmiş averaj → atılan gol.
- Kırpma 0–3 puan; kırılan puana xG karışmaz.
