import type {Repository} from "@/types/repository";

export class RepositoryService{
    validateUrl(url : string) : boolean{
        try {
            const pathUrl = new URL(url);

            return (pathUrl.protocol === "https:" && pathUrl.hostname === "github.com");
        } catch (error) {
            return false;
        }
    }

    createRepository(url : string) : Repository{
        if(!this.validateUrl(url)){
            throw new Error("Invalid repository url");
        }

        const pathUrl = new URL(url);

        return {
            url: url,
            path: pathUrl.pathname,
        }
    }
}