export interface AppDownloadLink {
  link: string;
  size: string;
}

export interface AppVersion {
  _id: string;
  minimum_accepted_version: string;
  download_links: { [os: string]: AppDownloadLink };
  release_date: string;
}
