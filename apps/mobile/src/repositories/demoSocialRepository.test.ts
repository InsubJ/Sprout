import { DemoSocialRepository } from "./demoSocialRepository";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("DemoSocialRepository", () => {
  it("restores a daily nudge and rejects a duplicate", async () => {
    const repository = new DemoSocialRepository(createStorage());
    const nudge = await repository.sendNudge("sender", "receiver", "habit");
    await expect(
      repository.getNudgedHabitIds("sender", "receiver", nudge.nudged_at),
    ).resolves.toEqual(["habit"]);
    await expect(repository.sendNudge("sender", "receiver", "habit")).rejects.toThrow(
      "already nudged",
    );
  });

  it("provides an accepted demo friendship for every demo identity", async () => {
    const repository = new DemoSocialRepository(createStorage());
    const friendships = await repository.getFriendships("demo-user");
    expect(friendships).toHaveLength(1);
    expect(friendships[0].status).toBe("accepted");
  });

  it("allows a new request after decline and lets the requester cancel it", async () => {
    const repository = new DemoSocialRepository(createStorage());
    const requesterId = "retry-requester";
    const receiverId = "retry-receiver";
    const original = await repository.sendFriendRequest(requesterId, receiverId);
    await repository.respond(original.id, "declined");

    const retry = await repository.sendFriendRequest(requesterId, receiverId);
    expect(retry).toMatchObject({ user_id: requesterId, friend_id: receiverId, status: "pending" });
    expect(retry.id).not.toBe(original.id);

    await repository.cancelFriendRequest(retry.id, requesterId);
    await expect(repository.cancelFriendRequest(retry.id, requesterId)).rejects.toThrow(
      "not found",
    );
  });
});
