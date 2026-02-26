// Hydra Launcher Tip Tanımları

declare module "@hydra/types" {
  export interface Game {
    id: string;
    title: string;
    description?: string;
    cover?: string;
    url: string;
    source: string;
    downloadOptions?: DownloadOption[];
  }

  export interface DownloadOption {
    title: string;
    url: string;
    type: "torrent" | "magnet" | "direct" | "mirror";
    size?: string;
    quality?: string;
  }

  export interface Source {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    language: string;
    baseUrl: string;
    
    search(query: string): Promise<Game[]>;
    getDetails(gameId: string): Promise<Game | null>;
    getPopularGames?(): Promise<Game[]>;
  }
}
