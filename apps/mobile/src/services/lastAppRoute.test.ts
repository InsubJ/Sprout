import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  isRestorableAppRoute,
  normalizeRestorableAppRoute,
  readLastAppRoute,
  startupRouteToRestore,
  writeLastAppRoute,
} from "./lastAppRoute";

describe("last app route persistence", () => {
  beforeEach(async () => AsyncStorage.clear());

  it("restores a tab for the same user", async () => {
    await writeLastAppRoute("user-1", "/sanctuary");
    expect(await readLastAppRoute("user-1")).toBe("/sanctuary");
    expect(await readLastAppRoute("user-2")).toBeNull();
  });

  it("allows supported detail routes", () => {
    expect(isRestorableAppRoute("/friend-forest/abc-123")).toBe(true);
    expect(isRestorableAppRoute("/habit/abc-123")).toBe(true);
  });

  it("normalizes Expo route groups before persisting", async () => {
    expect(normalizeRestorableAppRoute("/(tabs)/sanctuary")).toBe("/sanctuary");
    await writeLastAppRoute("user-1", "/(tabs)/friend-sanctuary/abc-123");
    expect(await readLastAppRoute("user-1")).toBe("/friend-sanctuary/abc-123");
  });

  it("does not persist authentication or unknown routes", async () => {
    await writeLastAppRoute("user-1", "/login");
    expect(await readLastAppRoute("user-1")).toBeNull();
    expect(isRestorableAppRoute("https://example.com")).toBe(false);
  });

  it("restores a saved tab when startup initially selects Forest", () => {
    expect(startupRouteToRestore("/lab", "/forest")).toBe("/lab");
    expect(startupRouteToRestore("/(tabs)/sanctuary", "/sanctuary")).toBeNull();
    expect(startupRouteToRestore("/login", "/forest")).toBeNull();
  });
});
