import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { writeLastAppRoute } from "../services/lastAppRoute";
import { usePersistentAppRoute } from "./usePersistentAppRoute";

let mockPathname = "/forest";
const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  const router = { replace: (route: string) => mockReplace(route) };
  return {
    usePathname: () => mockPathname,
    useRouter: () => router,
  };
});

describe("usePersistentAppRoute", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockPathname = "/forest";
    mockReplace.mockClear();
  });

  it("restores the saved tab before recording the startup Forest route", async () => {
    await writeLastAppRoute("user-1", "/lab");
    const setItem = jest.spyOn(AsyncStorage, "setItem");
    setItem.mockClear();

    const { rerender } = await renderHook(() => usePersistentAppRoute("user-1"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/lab"));
    expect(setItem).not.toHaveBeenCalled();

    await act(async () => {
      mockPathname = "/lab";
      rerender(undefined);
    });

    await waitFor(() => expect(setItem).toHaveBeenCalledWith(expect.any(String), "/lab"));
  });
});
