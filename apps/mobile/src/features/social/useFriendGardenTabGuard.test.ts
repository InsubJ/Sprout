import { act, renderHook } from "@testing-library/react-native";
import { useFriendGardenTabGuard } from "./useFriendGardenTabGuard";

describe("useFriendGardenTabGuard", () => {
  it("confirms the personal tab selected while visiting a friend", async () => {
    const navigate = jest.fn();
    const preventDefault = jest.fn();
    const { result } = await renderHook(() => useFriendGardenTabGuard(true, navigate));

    await act(() => result.current.guardTabPress("profile")({ preventDefault }));

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.confirmationVisible).toBe(true);

    await act(() => result.current.confirmExit());

    expect(navigate).toHaveBeenCalledWith("/(tabs)/profile");
    expect(result.current.confirmationVisible).toBe(false);
  });

  it("dismisses without navigating", async () => {
    const navigate = jest.fn();
    const { result } = await renderHook(() => useFriendGardenTabGuard(true, navigate));

    await act(() => result.current.guardTabPress("lab")({ preventDefault: jest.fn() }));
    await act(() => result.current.dismissExit());

    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.confirmationVisible).toBe(false);
  });

  it("does not intercept personal tabs outside a friend's garden", async () => {
    const navigate = jest.fn();
    const preventDefault = jest.fn();
    const { result } = await renderHook(() => useFriendGardenTabGuard(false, navigate));

    await act(() => result.current.guardTabPress("sanctuary")({ preventDefault }));

    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.confirmationVisible).toBe(false);
  });
});
