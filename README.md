# Düdük Payı

Hakem kararları düzeltilseydi Süper Lig puan tablosu ne olurdu?

Canlı: https://metoapps.github.io/Dudukpayi/

Tek dosya: `index.html` (HTML + CSS + JS).

## Model

- Skor kararları kesinlik ihtimaliyle gerçekleşir. Gerçekleşen gol tam gol sayılır; geçlik (dakika/90) kadarı maç sonu skoruna, kalanı olay anındaki skora yazılıp kalan süre Poisson'la oynatılır.
- Karara isteğe bağlı "olaydan önceki skor" girilebilir; girilirse oyun durumu hesaba katılır, girilmezse maç sonu skoru kullanılır.
- Karşılıklı hatalar (iki tarafın da golü iptal) birbirini götürür.
- Verilmeyen penaltı = 0,76 gol ihtimali. Kırmızı, kalan süre ve ev/deplasman tabanı üzerinde 0,65 / 0,35 kaymasıdır; kalan süre (96 − dakika)/90, 96′ ve sonrası 0.
- Bant: kesinlik ±20.
- Sıralama TFF: puan → (ikili seri tamamsa) kendi araları → genel düzeltilmiş averaj → atılan gol.
- Kırpma 0–3 puan; kırılan puana xG karışmaz.

## Test

`node tests/regression.test.js`

## Erişim

- İzleme linki (`?izle=…`): salt okunur tablo; arkadaşlara giden link budur.
- Düz adres: giriş ekranı. Yazma anahtarı bir kez girilen cihaz hatırlanır (kodda yalnız SHA-256 özeti var).
- Arayüz kilididir; ortak defterin gerçek koruması değildir.
