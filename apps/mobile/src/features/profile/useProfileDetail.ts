import { useEffect, useState } from "react";
import type { Profile } from "@sprout/shared";
import { useServices } from "../../providers/ServicesProvider";

export function useProfileDetail(id?: string): Profile | null | undefined {
  const { profiles } = useServices();
  const [profile, setProfile] = useState<Profile | null | undefined>();
  useEffect(() => {
    let active = true;
    if (!profiles || !id) {
      setProfile(null);
      return () => {
        active = false;
      };
    }
    setProfile(undefined);
    void profiles.getById(id).then(
      (value) => {
        if (active) setProfile(value);
      },
      () => {
        if (active) setProfile(null);
      },
    );
    return () => {
      active = false;
    };
  }, [id, profiles]);
  return profile;
}
