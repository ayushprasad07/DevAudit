import type { ResolvedDependency } from "@/types/dependency";

type JsonRecord = Record<string, unknown>;

interface LockfilePackage {
  version?: string;
  resolved?: string;
  integrity?: string;
  link?: boolean;
  dependencies?: JsonRecord;
  devDependencies?: JsonRecord;
  optionalDependencies?: JsonRecord;
  peerDependencies?: JsonRecord;
}

export class NpmLockfileParser {
  parse(content: string): ResolvedDependency[] {
    let lockfile: JsonRecord;

    try {
      const parsed: unknown = JSON.parse(content);

      if (!this.isRecord(parsed)) {
        throw new Error("Expected a JSON object");
      }

      lockfile = parsed;
    } catch (error) {
      throw new Error("Invalid package-lock.json file");
    }

    const lockfileVersion = lockfile.lockfileVersion;

    if (lockfileVersion !== 2 && lockfileVersion !== 3) {
      throw new Error(
        `Unsupported npm lockfile version: ${String(lockfileVersion)}. Supported versions are 2 and 3.`,
      );
    }

    const packages = lockfile.packages;

    if (!this.isRecord(packages)) {
      throw new Error("Invalid package-lock.json: missing packages object");
    }

    const rootPackage = this.isRecord(packages[""])
      ? (packages[""] as LockfilePackage)
      : {};

    const packageEntries = new Map<string, LockfilePackage>();

    for (const [packagePath, value] of Object.entries(packages)) {
      if (!packagePath || !this.isRecord(value)) {
        continue;
      }

      const packageInfo = value as LockfilePackage;

      if (
        packageInfo.link === true ||
        typeof packageInfo.version !== "string"
      ) {
        continue;
      }

      packageEntries.set(packagePath, packageInfo);
    }

    const rootDependencyNames = this.getDependencyNames(rootPackage);

    const directPackagePath = new Set<String>();

    for (const dependencyNames of rootDependencyNames) {
      const resolvedPath = this.resolvePackagePath(
        "",
        dependencyNames,
        packageEntries,
      );

      if (resolvedPath) {
        directPackagePath.add(resolvedPath);
      }
    }

    const resolvedDependencies: ResolvedDependency[] = [];

    for (const [packagePath, packageInfo] of packageEntries) {
      const dependencyNames = this.getDependencyNames(packageInfo);

      const dependencyIds = dependencyNames
        .map((dependencyName) =>
          this.resolvePackagePath(packagePath, dependencyName, packageEntries),
        )
        .filter((id): id is string => id !== undefined)
        .sort();

      const dependency: ResolvedDependency = {
        id: packagePath,
        name: this.getPackageName(packagePath),
        version: packageInfo.version!,
        ecosystem: "javascript",
        direct: directPackagePath.has(packagePath),
        dependencies: dependencyIds,
      };

      if (typeof packageInfo.integrity === "string") {
        dependency.integrity = packageInfo.integrity;
      }

      if (typeof packageInfo.resolved === "string") {
        dependency.resolvedUrl = packageInfo.resolved;
      }

      resolvedDependencies.push(dependency);
    }

    return resolvedDependencies.sort((a, b) => a.id.localeCompare(b.id));
  }

  private isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value != null && !Array.isArray(value);
  }

  private getDependencyNames(packageInfo: LockfilePackage): string[] {
    const sections = [
      packageInfo.dependencies,
      packageInfo.devDependencies,
      packageInfo.optionalDependencies,
      packageInfo.peerDependencies,
    ];

    const names = new Set<string>();

    for (const section of sections) {
      if (!section || !this.isRecord(section)) {
        continue;
      }

      for (const name of Object.keys(section)) {
        names.add(name);
      }
    }

    return [...names].sort();
  }

  private getPackageName(packagePath: string): string {
    const marker = "node_modules/";
    const index = packagePath.lastIndexOf(marker);

    if (index === -1) {
      return packagePath;
    }

    return packagePath.slice(index + marker.length);
  }

  private resolvePackagePath(
    importerPath: string,
    dependencyName: string,
    packages: Map<string, LockfilePackage>,
  ): string | undefined {
    let currentPath = importerPath;

    while (true) {
      const candidate = currentPath
        ? `${currentPath}/node_modules/${dependencyName}`
        : `node_modules/${dependencyName}`;

      if (packages.has(candidate)) {
        return candidate;
      }

      const parentIndex = currentPath.lastIndexOf("/node_modules/");

      if (parentIndex !== -1) {
        currentPath = currentPath.slice(0, parentIndex);
      } else if (currentPath !== "") {
        currentPath = "";
      } else {
        break;
      }
    }

    return undefined;
  }
}
