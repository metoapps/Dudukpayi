# TOOLS — Düdük Payı

Güncelleme: 2026-10-18. Bu dosya çalışma kurallarıdır; henüz yeni kütüphane kurulmadı.

## Mevcut mimari
- Ana uygulama tek dosya: index.html (HTML, CSS, JavaScript).
- TFF sıralaması, tahmini puan matematiği, hakem kararı kayıtları ve görselleştirme birbirinden farklı risk taşır.

## Araç adayları
| Araç | Durum | Kullanım | Kabul koşulu |
| --- | --- | --- | --- |
| Lucide | ADAY — kurulu değil | Sekme ve işlem ikonları | Mobil görünüm ve mevcut simge sistemi bozulmamalı |
| Fontsource | ADAY — kurulu değil | Tipografi | Mevcut fontlarla karşılaştırılmalı |
| SVGO | GELİŞTİRME ARACI | SVG varlık optimizasyonu | Görsel regresyon olmamalı |

## Güvenli geliştirme
1. Önce commit SHA ve çalışan sürüm kaydedilir.
2. Main'den ayrı özellik dalı açılır; değişiklik PR olarak incelenir.
3. Kozmetik değişikliklerde futbol/puan hesaplarına dokunulmaz.
4. Mevcut sıralama, maç ekleme, sekmeler, mobil sabit başlık ve sosyal paylaşım kartı kontrol edilir.
5. Harici kod eklenirse resmi kaynak, sabit sürüm, lisans, yükleme yöntemi ve geri alma açıklanır.
6. Testin yapıldığı iddia edilmez; gerçekten çalıştırılan adımlar raporlanır.

## Öncelik
Görsel tutarlılık için ufak simge denemeleri; büyük çatı değişimi veya zorunlu npm dönüşümü yok.

## Yardımcılarla çalışma
ChatGPT/Claude önce README.md, TOOLS.md ve index.html okur; her değişiklik için kısa test ve geri alma notu sunar.
