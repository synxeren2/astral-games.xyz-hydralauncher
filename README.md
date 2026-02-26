# Astral Games - Hydra Launcher Eklentisi

Bu eklenti, Astral Games sitesinden oyun indirme linklerini Hydra Launcher içinde görüntülemenizi sağlar.

## Özellikler

- **Oyun Arama**: Astral Games kütüphanesinde oyun arayın
- **İndirme Linkleri**: Torrent, Magnet ve doğrudan indirme linklerini görüntüleyin
- **Oyun Detayları**: Oyun açıklamaları ve kapak görselleri
- **Popüler Oyunlar**: Ana sayfadaki popüler oyunları görüntüleyin

## Kurulum

### Yöntem 1: Manuel Kurulum

1. Hydra Launcher'ı açın
2. Ayarlar (Settings) > Kaynaklar (Sources) bölümüne gidin
3. "Kaynak Ekle" (Add Source) butonuna tıklayın
4. Bu eklenti klasörünü seçin veya `manifest.json` dosyasını yükleyin

### Yöntem 2: Klasör Kopyalama

1. Hydra Launcher'ın eklenti klasörünü bulun:
   - Windows: `%APPDATA%/Hydra/sources/`
   - Linux: `~/.config/Hydra/sources/`
   - macOS: `~/Library/Application Support/Hydra/sources/`

2. `hydra-astral-games-plugin` klasörünü bu dizine kopyalayın

3. Hydra Launcher'ı yeniden başlatın

## Kullanım

1. Hydra Launcher'ı açın
2. Arama çubuğına oyun adı yazın
3. "Astral Games" kaynağından sonuçları görüntüleyin
4. Bir oyun seçin ve indirme linklerini görüntüleyin
5. İstediğiniz indirme yöntemini (Torrent/Magnet/Direct) seçin

## Desteklenen İndirme Türleri

- **Torrent** (.torrent dosyaları)
- **Magnet** (magnet:? linkleri)
- **Doğrudan İndirme** (HTTP/HTTPS linkleri)

## Notlar

- Bu eklenti Astral Games sitesinin yapısına bağlıdır
- Site yapısı değişirse eklenti güncellenmelidir
- İndirme linkleri sitenin sunduğu kaynaklara bağlıdır

## Sorun Giderme

**Eklenti görünmüyor:**
- Hydra Launcher'ı yeniden başlatın
- Eklenti klasörünün doğru konumda olduğunu kontrol edin
- `manifest.json` dosyasının doğru formatta olduğunu kontrol edin

**Oyunlar bulunamıyor:**
- Site erişilebilirliğini kontrol edin
- İnternet bağlantınızı kontrol edin
- Site yapısının değişip değişmediğini kontrol edin

**İndirme linkleri çalışmıyor:**
- Linklerin güncel olduğundan emin olun
- Siteye göz atarak linklerin çalıştığını doğrulayın

## Güncelleme Geçmişi

### v1.0.0
- İlk sürüm
- Oyun arama özelliği
- İndirme linkleri çekme (Torrent, Magnet, Direct)
- Oyun detayları görüntüleme

## Lisans

Bu eklenti MIT lisansı altında dağıtılmaktadır.

## İletişim

Sorularınız veya önerileriniz için GitHub üzerinden issue açabilirsiniz.
