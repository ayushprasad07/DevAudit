export interface RawRelease{
    version : string;
    body : string;
    title : string;
    publishedAt : Date;
    url : string;
}

export interface ReleaseItem{
    version: string;
    category: string;
    title: string;
    description: string;
}