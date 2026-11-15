import { describe, expect, it } from "vitest";
import { NpmLockfileParser } from "../NpmLockfileParser";

describe("NpmLockfileParser", () => {
  const parser = new NpmLockfileParser();

  it("parses direct and transitive dependencies", () => {
    const lockfile = {
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            express: "^4.21.0",
          },
        },
        "node_modules/express": {
          version: "4.21.2",
          dependencies: {
            accepts: "~1.3.8",
          },
        },
        "node_modules/accepts": {
          version: "1.3.8",
          dependencies: {
            negotiator: "0.6.3",
          },
        },
        "node_modules/negotiator": {
          version: "0.6.3",
        },
      },
    };

    const result = parser.parse(JSON.stringify(lockfile));

    expect(result).toHaveLength(3);

    const express = result.find((pkg) => pkg.name === "express");
    const accepts = result.find((pkg) => pkg.name === "accepts");
    const negotiator = result.find((pkg) => pkg.name === "negotiator");

    expect(express?.direct).toBe(true);
    expect(accepts?.direct).toBe(false);

    expect(express?.dependencies).toEqual(["node_modules/accepts"]);

    expect(accepts?.dependencies).toEqual(["node_modules/negotiator"]);

    expect(negotiator?.dependencies).toEqual([]);
  });

  it("preserves duplicate packages installed at different versions", () => {
    const lockfile = {
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            alpha: "1.0.0",
            beta: "1.0.0",
          },
        },
        "node_modules/alpha": {
          version: "1.0.0",
          dependencies: {
            shared: "^1.0.0",
          },
        },
        "node_modules/beta": {
          version: "1.0.0",
          dependencies: {
            shared: "^2.0.0",
          },
        },
        "node_modules/shared": {
          version: "1.5.0",
        },
        "node_modules/beta/node_modules/shared": {
          version: "2.5.0",
        },
      },
    };

    const result = parser.parse(JSON.stringify(lockfile));

    const sharedPackages = result.filter((pkg) => pkg.name === "shared");

    expect(sharedPackages).toHaveLength(2);

    expect(sharedPackages.map((pkg) => pkg.version).sort()).toEqual([
      "1.5.0",
      "2.5.0",
    ]);

    const beta = result.find((pkg) => pkg.name === "beta");

    expect(beta?.dependencies).toEqual([
      "node_modules/beta/node_modules/shared",
    ]);
  });

  it("supports scoped packages", () => {
    const lockfile = {
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            "@scope/example": "^1.0.0",
          },
        },
        "node_modules/@scope/example": {
          version: "1.2.0",
        },
      },
    };

    const result = parser.parse(JSON.stringify(lockfile));

    expect(result[0].name).toBe("@scope/example");
    expect(result[0].direct).toBe(true);
  });

  it("supports npm lockfile version 2", () => {
    const lockfile = {
      lockfileVersion: 2,
      packages: {
        "": {
          dependencies: {
            express: "^4.21.0",
          },
        },
        "node_modules/express": {
          version: "4.21.2",
        },
      },
    };

    const result = parser.parse(JSON.stringify(lockfile));

    expect(result).toHaveLength(1);
    expect(result[0].version).toBe("4.21.2");
  });

  it("throws an error for invalid JSON", () => {
    expect(() => parser.parse("{ invalid json")).toThrow(
      "Invalid package-lock.json file",
    );
  });

  it("rejects unsupported lockfile versions", () => {
    const lockfile = {
      lockfileVersion: 1,
      packages: {},
    };

    expect(() => parser.parse(JSON.stringify(lockfile))).toThrow(
      "Unsupported npm lockfile version",
    );
  });
});
