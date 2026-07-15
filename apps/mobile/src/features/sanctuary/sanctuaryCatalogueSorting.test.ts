import {
  compareSanctuaryCatalogueItems,
  nextSanctuarySortState,
  type SanctuaryCatalogueItem,
  type SanctuarySortState,
} from "./sanctuaryCatalogueSorting";

function customItem(name: string, createdAt: string): SanctuaryCatalogueItem {
  return {
    kind: "custom",
    plant: { displayName: name, createdAt },
  } as SanctuaryCatalogueItem;
}

function itemName(item: SanctuaryCatalogueItem): string {
  return item.kind === "custom" ? item.plant.displayName : item.habit.name;
}

describe("Sanctuary catalogue sorting", () => {
  it("merges A–Z and Z–A into one reversible name option", () => {
    const initial: SanctuarySortState = { field: "name", direction: "ascending" };
    expect(nextSanctuarySortState(initial, "name")).toEqual({
      field: "name",
      direction: "descending",
    });
  });

  it("defaults recently added to newest first and reverses on a second selection", () => {
    const nameSort: SanctuarySortState = { field: "name", direction: "descending" };
    const newestFirst = nextSanctuarySortState(nameSort, "added");
    expect(newestFirst).toEqual({ field: "added", direction: "descending" });
    expect(nextSanctuarySortState(newestFirst, "added")).toEqual({
      field: "added",
      direction: "ascending",
    });
  });

  it("orders recently added plants in either direction", () => {
    const older = customItem("Older", "2026-07-01T00:00:00.000Z");
    const newer = customItem("Newer", "2026-07-14T00:00:00.000Z");
    const items = [older, newer];
    const newestFirst = [...items].sort((left, right) =>
      compareSanctuaryCatalogueItems(left, right, {
        field: "added",
        direction: "descending",
      }),
    );
    const oldestFirst = [...items].sort((left, right) =>
      compareSanctuaryCatalogueItems(left, right, {
        field: "added",
        direction: "ascending",
      }),
    );
    expect(newestFirst.map(itemName)).toEqual(["Newer", "Older"]);
    expect(oldestFirst.map(itemName)).toEqual(["Older", "Newer"]);
  });
});
