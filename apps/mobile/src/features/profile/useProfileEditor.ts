import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useDataRevision } from "../../providers/DataProvider";
import { useServices } from "../../providers/ServicesProvider";

export interface ProfileEditorState {
  displayName: string;
  setDisplayName: Dispatch<SetStateAction<string>>;
  username: string;
  avatar: string | null;
  setAvatar: Dispatch<SetStateAction<string | null>>;
  loaded: boolean;
  save: () => Promise<void>;
}
export function useProfileEditor(): ProfileEditorState {
  const { user } = useAuth();
  const { invalidate } = useDataRevision();
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
    const saved = await profiles.update({
      id: user.id,
      display_name: displayName.trim() || null,
      avatar_url: avatar,
    });
    setDisplayName(saved.display_name ?? "");
    setAvatar(saved.avatar_url);
    invalidate();
  }, [avatar, displayName, invalidate, profiles, user]);
  return { displayName, setDisplayName, username, avatar, setAvatar, loaded, save };
}
