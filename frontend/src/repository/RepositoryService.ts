import type {Repository} from "@/types/repository";

export class RepositoryService{
    validateUrl(url : string) : boolean{
        try {
            const parsedUrl = new URL(url);

            if (
                parsedUrl.protocol !== "https:" ||
                parsedUrl.hostname !== "github.com" ||
                parsedUrl.username !== "" ||
                parsedUrl.password !== "" ||
                parsedUrl.port !== "" ||
                parsedUrl.search !== "" ||
                parsedUrl.hash !== ""
            ) {
                return false;
            }

            const segments = parsedUrl.pathname.split("/").filter(Boolean);

            if (segments.length !== 2) {
                return false;
            }

            const [owner, repository] = segments;

            if (
                !owner ||
                !repository ||
                owner === "." ||
                owner === ".." ||
                repository === "." ||
                repository === ".." ||
                repository.includes("\\") ||
                repository.includes(":")
            ) {
                return false;
            }

            return true;

            // return (parsedUrl.protocol === "https:" && parsedUrl.hostname === "github.com");
        } catch (error) {
            return false;
        }
    }

    createRepository(url : string) : Repository{
        if (!this.validateUrl(url)) {
            throw new Error("Invalid GitHub repository URL");
        }

        const parsedUrl = new URL(url);
        const segments = parsedUrl.pathname.split("/").filter(Boolean);

        return {
            url: `https://github.com/${segments[0]}/${segments[1]}.git`,
            path: `/${segments[0]}/${segments[1]}`,
        };
    }
}