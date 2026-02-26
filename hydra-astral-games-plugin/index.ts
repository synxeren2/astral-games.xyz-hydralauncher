import { Source, Game, DownloadOption } from "@hydra/types";

export default class AstralGamesSource implements Source {
  id = "astral-games";
  name = "Astral Games";
  description = "Astral Games - Oyun indirme kaynağı";
  version = "1.0.0";
  author = "Hydra Plugin";
  language = "tr";
  baseUrl = "https://astral-games.xyz";

  async search(query: string): Promise<Game[]> {
    try {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();

      const games: Game[] = [];
      const gameRegex = /<div class="game-card"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>.*?<a href="(\/game\/[^"]*)"[^>]*>.*?<img src="([^"]*)"[^>]*>.*?<\/div>/gs;
      
      let match;
      while ((match = gameRegex.exec(html)) !== null) {
        const title = match[1].trim();
        const gamePath = match[2];
        const cover = match[3].startsWith('http') ? match[3] : `${this.baseUrl}${match[3]}`;
        
        games.push({
          id: `astral-${gamePath.replace('/game/', '')}`,
          title: title,
          cover: cover,
          url: `${this.baseUrl}${gamePath}`,
          source: this.id,
        });
      }

      // Alternatif parse yöntemi - daha genel yapı
      if (games.length === 0) {
        const altRegex = /<a[^>]*href="(\/[^"]*(?:game|oyun)[^"]*)"[^>]*>.*?<h[1-6][^>]*>(.*?)<\/h[1-6]>|<div[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>(.*?)<\/div>/gs;
        while ((match = altRegex.exec(html)) !== null) {
          const gamePath = match[1];
          const title = (match[2] || match[3] || '').trim();
          if (title && gamePath) {
            games.push({
              id: `astral-${gamePath.replace(/\//g, '-')}`,
              title: title,
              url: `${this.baseUrl}${gamePath}`,
              source: this.id,
            });
          }
        }
      }

      return games;
    } catch (error) {
      console.error("Astral Games arama hatası:", error);
      return [];
    }
  }

  async getDetails(gameId: string): Promise<Game | null> {
    try {
      const gamePath = gameId.replace('astral-', '').replace(/-/g, '/');
      const gameUrl = gamePath.startsWith('http') ? gamePath : `${this.baseUrl}/game/${gamePath}`;
      
      const response = await fetch(gameUrl);
      const html = await response.text();

      // Oyun başlığını çek
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
      const title = titleMatch ? titleMatch[1].trim() : "Bilinmeyen Oyun";

      // Açıklama çek
      const descMatch = html.match(/<div[^>]*class="[^"]*(?:description|about|summary)[^"]*"[^>]*>(.*?)<\/div>/s);
      const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : "";

      // Kapak resmi çek
      const coverMatch = html.match(/<img[^>]*class="[^"]*(?:cover|poster|main-image)[^"]*"[^>]*src="([^"]*)"/);
      const cover = coverMatch ? (coverMatch[1].startsWith('http') ? coverMatch[1] : `${this.baseUrl}${coverMatch[1]}`) : "";

      // İndirme linklerini çek
      const downloadOptions: DownloadOption[] = [];
      
      // Torrent linkleri
      const torrentRegex = /<a[^>]*href="([^"]*\.torrent[^"]*)"[^>]*>(.*?)<\/a>/g;
      let torrentMatch;
      while ((torrentMatch = torrentRegex.exec(html)) !== null) {
        downloadOptions.push({
          title: `Torrent: ${torrentMatch[2].replace(/<[^>]*>/g, '').trim()}`,
          url: torrentMatch[1].startsWith('http') ? torrentMatch[1] : `${this.baseUrl}${torrentMatch[1]}`,
          type: "torrent",
        });
      }

      // Magnet linkleri
      const magnetRegex = /<a[^>]*href="(magnet:[^"]*)"[^>]*>(.*?)<\/a>/g;
      let magnetMatch;
      while ((magnetMatch = magnetRegex.exec(html)) !== null) {
        downloadOptions.push({
          title: `Magnet: ${magnetMatch[2].replace(/<[^>]*>/g, '').trim()}`,
          url: magnetMatch[1],
          type: "magnet",
        });
      }

      // HTTP indirme linkleri
      const downloadRegex = /<a[^>]*href="([^"]*(?:download|indir)[^"]*)"[^>]*>(.*?)<\/a>/gi;
      let downloadMatch;
      while ((downloadMatch = downloadRegex.exec(html)) !== null) {
        const url = downloadMatch[1];
        const linkText = downloadMatch[2].replace(/<[^>]*>/g, '').trim();
        
        // Torrent veya magnet değilse HTTP olarak ekle
        if (!url.includes('.torrent') && !url.startsWith('magnet:')) {
          downloadOptions.push({
            title: linkText || "İndir",
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            type: "direct",
          });
        }
      }

      // Alternatif: data-download attribute'ları
      const dataDownloadRegex = /<[^>]*data-download="([^"]*)"[^>]*>(.*?)<\/[^>]*>/g;
      let dataMatch;
      while ((dataMatch = dataDownloadRegex.exec(html)) !== null) {
        downloadOptions.push({
          title: dataMatch[2].replace(/<[^>]*>/g, '').trim() || "İndir",
          url: dataMatch[1].startsWith('http') ? dataMatch[1] : `${this.baseUrl}${dataMatch[1]}`,
          type: "direct",
        });
      }

      return {
        id: gameId,
        title: title,
        description: description,
        cover: cover,
        url: gameUrl,
        source: this.id,
        downloadOptions: downloadOptions,
      };
    } catch (error) {
      console.error("Astral Games detay çekme hatası:", error);
      return null;
    }
  }

  async getPopularGames(): Promise<Game[]> {
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();

      const games: Game[] = [];
      const gameRegex = /<div class="game-card"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>.*?<a href="(\/game\/[^"]*)"[^>]*>.*?<img src="([^"]*)"[^>]*>.*?<\/div>/gs;
      
      let match;
      while ((match = gameRegex.exec(html)) !== null) {
        const title = match[1].trim();
        const gamePath = match[2];
        const cover = match[3].startsWith('http') ? match[3] : `${this.baseUrl}${match[3]}`;
        
        games.push({
          id: `astral-${gamePath.replace('/game/', '')}`,
          title: title,
          cover: cover,
          url: `${this.baseUrl}${gamePath}`,
          source: this.id,
        });
      }

      return games;
    } catch (error) {
      console.error("Astral Games popüler oyunlar hatası:", error);
      return [];
    }
  }
}
