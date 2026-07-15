import { PAGE_CONTENT_MAX_WIDTH } from "../../components/ResponsivePageContent";
import { calculateLabResponsiveLayout } from "./labResponsiveLayout";

describe("calculateLabResponsiveLayout", () => {
  it("uses one column on phone-sized containers", () => {
    expect(calculateLabResponsiveLayout(390).columns).toBe(1);
  });

  it("uses two columns on medium containers", () => {
    const layout = calculateLabResponsiveLayout(768);
    expect(layout.columns).toBe(2);
    expect(layout.pageSize).toBe(6);
  });

  it("caps large layouts at a three-column reading width", () => {
    const layout = calculateLabResponsiveLayout(PAGE_CONTENT_MAX_WIDTH);
    expect(layout.columns).toBe(3);
    expect(layout.pageSize).toBe(9);
    expect(layout.cardWidth).toBeGreaterThan(300);
  });

  it("rejects invalid measurements", () => {
    expect(() => calculateLabResponsiveLayout(0)).toThrow(RangeError);
  });
});
