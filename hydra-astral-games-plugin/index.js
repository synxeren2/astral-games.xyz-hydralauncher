// Hydra Launcher Astral Games Plugin - JavaScript Version
// Bu dosya TypeScript derlenmeden doğrudan kullanılabilir

class AstralGamesSource {
  constructor() {
    this.id = "astral-games";
    this.name = "Astral Games";
    this.description = "Astral Games - Oyun indirme kaynağı";
    this.version = "1.0.0";
    this.author = "Hydra Plugin";
    this.language = "tr";
    this.baseUrl = "https://astral-games.xyz";
  }

  async search(query) {
    try {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();

      const games = [];
      
      // Farklı olası yapılar için regex pattern'leri
      const patterns = [
        // Pattern 1: game-card yapısı
        /<div class="game-card"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>.*?<a href="(\/game\/[^"]*)"[^>]*>.*?<img src="([^"]*)"[^>]*>.*?<\/div>/gs,
        // Pattern 2: Genel oyun kartı
        /<div[^>]*class="[^"]*(?:game|oyun)[^"]*"[^>]*>.*?<a[^>]*href="(\/[^"]*(?:game|oyun)[^"]*)"[^>]*>.*?<img[^>]*src="([^"]*)"[^>]*>.*?<h[1-6][^>]*>(.*?)<\/h[1-6]>/gs,
        // Pattern 3: Liste görünümü
        /<a[^>]*href="(\/[^"]*(?:game|oyun|title)[^"]*)"[^>]*>.*?<span[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>(.*?)<\/span>/gs,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          let title, gamePath, cover;
          
          if (match.length === 4) {
            title = match[1].trim();
            gamePath = match[2];
            cover = match[3];
          } else {
            gamePath = match[1];
            cover = match[2];
            title = match[3].trim();
          }

          if (title && gamePath) {
            games.push({
              id: `astral-${gamePath.replace(/\//g, '-').replace(/^-/, '')}`,
              title: this.cleanHtml(title),
              cover: cover && cover.startsWith('http') ? cover : cover ? `${this.baseUrl}${cover}` : "",
              url: gamePath.startsWith('http') ? gamePath : `${this.baseUrl}${gamePath}`,
              source: this.id,
            });
          }
        }
      }

      // Tekrarlanan oyunları kaldır
      const uniqueGames = games.filter((game, index, self) =>
        index === self.findIndex((g) => g.id === game.id)
      );

      return uniqueGames;
    } catch (error) {
      console.error("Astral Games arama hatası:", error);
      return [];
    }
  }

  async getDetails(gameId) {
    try {
      const gamePath = gameId.replace('astral-', '').replace(/-/g, '/');
      const gameUrl = gamePath.startsWith('http') ? gamePath : `${this.baseUrl}/game/${gamePath}`;
      
      const response = await fetch(gameUrl);
      const html = await response.text();

      // Oyun başlığı
      const titlePatterns = [
        /<h1[^>]*>(.*?)<\/h1>/,
        /<h2[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>(.*?)<\/h2>/,
        /<div[^>]*class="[^"]*(?:game-title|title)[^"]*"[^>]*>(.*?)<\/div>/,
      ];

      let title = "Bilinmeyen Oyun";
      for (const pattern of titlePatterns) {
        const match = html.match(pattern);
        if (match) {
          title = this.cleanHtml(match[1]);
          break;
        }
      }

      // Açıklama
      const descPatterns = [
        /<div[^>]*class="[^"]*(?:description|about|summary|desc)[^"]*"[^>]*>(.*?)<\/div>/s,
        /<p[^>]*class="[^"]*(?:description|about)[^"]*"[^>]*>(.*?)<\/p>/s,
        /<section[^>]*class="[^"]*(?:description|about)[^"]*"[^>]*>(.*?)<\/section>/s,
      ];

      let description = "";
      for (const pattern of descPatterns) {
        const match = html.match(pattern);
        if (match) {
          description = this.cleanHtml(match[1]);
          break;
        }
      }

      // Kapak resmi
      const coverPatterns = [
        /<img[^>]*class="[^"]*(?:cover|poster|main-image|game-image)[^"]*"[^>]*src="([^"]*)"/,
        /<div[^>]*class="[^"]*(?:cover|poster)[^"]*"[^>]*>.*?<img[^>]*src="([^"]*)"/s,
        /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/,
      ];

      let cover = "";
      for (const pattern of coverPatterns) {
        const match = html.match(pattern);
        if (match) {
          cover = match[1].startsWith('http') ? match[1] : `${this.baseUrl}${match[1]}`;
          break;
        }
      }

      // İndirme linkleri
      const downloadOptions = this.extractDownloadLinks(html);

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

  extractDownloadLinks(html) {
    const downloadOptions = [];

    // Torrent linkleri
    const torrentRegex = /<a[^>]*href="([^"]*\.torrent[^"]*)"[^>]*>(.*?)<\/a>/gi;
    let match;
    while ((match = torrentRegex.exec(html)) !== null) {
      downloadOptions.push({
        title: `Torrent: ${this.cleanHtml(match[2]) || "İndir"}`,
        url: match[1].startsWith('http') ? match[1] : `${this.baseUrl}${match[1]}`,
        type: "torrent",
      });
    }

    // Magnet linkleri
    const magnetRegex = /<a[^>]*href="(magnet:\?[^"]*)"[^>]*>(.*?)<\/a>/gi;
    while ((match = magnetRegex.exec(html)) !== null) {
      const nameMatch = match[1].match(/dn=([^&]*)/);
      const name = nameMatch ? decodeURIComponent(nameMatch[1]) : "Magnet Link";
      downloadOptions.push({
        title: `Magnet: ${name}`,
        url: match[1],
        type: "magnet",
      });
    }

    // HTTP indirme linkleri
    const downloadPatterns = [
      { regex: /<a[^>]*href="([^"]*(?:download|indir)[^"]*)"[^>]*>(.*?)<\/a>/gi, type: "direct" },
      { regex: /<button[^>]*data-url="([^"]*(?:download|indir)[^"]*)"[^>]*>(.*?)<\/button>/gi, type: "direct" },
      { regex: /<a[^>]*data-download="([^"]*)"[^>]*>(.*?)<\/a>/gi, type: "direct" },
    ];

    for (const pattern of downloadPatterns) {
      while ((match = pattern.regex.exec(html)) !== null) {
        const url = match[1];
        const linkText = this.cleanHtml(match[2]);
        
        if (url && !url.includes('.torrent') && !url.startsWith('magnet:')) {
          const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
          
          // Aynı URL'in eklenip eklenmediğini kontrol et
          if (!downloadOptions.some(opt => opt.url === fullUrl)) {
            downloadOptions.push({
              title: linkText || "İndir",
              url: fullUrl,
              type: pattern.type,
            });
          }
        }
      }
    }

    // Part/parça linkleri
    const partRegex = /<a[^>]*href="([^"]*part\d+[^"]*)"[^>]*>(.*?)<\/a>/gi;
    while ((match = partRegex.exec(html)) !== null) {
      const url = match[1];
      const linkText = this.cleanHtml(match[2]);
      
      if (url && !downloadOptions.some(opt => opt.url === url)) {
        downloadOptions.push({
          title: linkText || "Part",
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          type: "direct",
        });
      }
    }

    return downloadOptions;
  }

  async getPopularGames() {
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();

      const games = [];
      
      // Popüler oyunları çek
      const patterns = [
        /<div class="game-card"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>.*?<a href="(\/game\/[^"]*)"[^>]*>.*?<img src="([^"]*)"[^>]*>.*?<\/div>/gs,
        /<div[^>]*class="[^"]*(?:popular|featured|trending)[^"]*"[^>]*>.*?<a[^>]*href="(\/[^"]*(?:game|oyun)[^"]*)"[^>]*>.*?<img[^>]*src="([^"]*)"[^>]*>.*?<h[1-6][^>]*>(.*?)<\/h[1-6]>/gs,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const title = this.cleanHtml(match[1]);
          const gamePath = match[2];
          const cover = match[3];
          
          if (title && gamePath) {
            games.push({
              id: `astral-${gamePath.replace(/\//g, '-').replace(/^-/, '')}`,
              title: title,
              cover: cover && cover.startsWith('http') ? cover : cover ? `${this.baseUrl}${cover}` : "",
              url: gamePath.startsWith('http') ? gamePath : `${this.baseUrl}${gamePath}`,
              source: this.id,
            });
          }
        }
      }

      // Tekrarlananları kaldır
      return games.filter((game, index, self) =>
        index === self.findIndex((g) => g.id === game.id)
      );
    } catch (error) {
      console.error("Astral Games popüler oyunlar hatası:", error);
      return [];
    }
  }

  cleanHtml(html) {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Hydra Launcher için export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AstralGamesSource;
}

// Varsayılan export
export default AstralGamesSource;
