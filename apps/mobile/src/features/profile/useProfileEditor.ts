import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export interface ProfileEditorState {
  displayName: string;
  setDisplayName: Dispatch<SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  avatar: string | null;
  setAvatar: Dispatch<SetStateAction<string | null>>;
  loaded: boolean;
  save: () => Promise<void>;
}
export function useProfileEditor(): ProfileEditorState {
  const { user } = useAuth();
  const { profiles } = useServices();
  const [displayName, setDisplayName] = useState("Sprout Gardener");
  const [username, setUsername] = useState("gardener");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    if (!user || !profiles) {
      setLoaded(true);
      return () => {
        active = false;
      };
    }
    void profiles.getById(user.id).then(
      (profile) => {
        if (!active || !profile) return;
        setDisplayName(profile.display_name ?? "");
        setUsername(profile.username);
        setAvatar(profile.avatar_url);
        setLoaded(true);
      },
      () => {
        if (active) setLoaded(true);
      },
    );
    return () => {
      active = false;
    };
  }, [profiles, user]);
  const save = useCallback(async (): Promise<void> => {
    if (!user || !profiles) return;
    if (username.trim().length < 3) throw new Error("Username must contain at least 3 characters");
    const current = await profiles.getById(user.id);
    if (!current) throw new Error("Profile is unavailable");
    await profiles.update({
      ...current,
      username: username.trim(),
      display_name: displayName.trim() || null,
      avatar_url: avatar,
    });
  }, [avatar, displayName, profiles, user, username]);
  return { displayName, setDisplayName, username, setUsername, avatar, setAvatar, loaded, save };
}
