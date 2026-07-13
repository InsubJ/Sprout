import { Ellipse } from "react-native-svg";
export function GroundShadow({ rx = 95, ry = 14 }: { rx?: number; ry?: number }) {
  return <Ellipse cx="200" cy="345" rx={rx} ry={ry} fill="#1B3B2B" opacity={0.15} />;
}
