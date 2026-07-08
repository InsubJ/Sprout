# Sprout Coding Rules & Guidelines

All development in this repository must adhere to the following software engineering principles. If any code does not fit within these requirements, it must be rewritten.

---

## 1. File Structure and Single Purpose (Single Responsibility Principle)
- **Rule**: Every file must have a single, well-defined purpose. You should be able to immediately understand what a file does by its name.
- **Naming Convention**: File names must be descriptive and specific. Do not use generic names like `helper.ts` or `index.ts` if they bundle multiple unrelated functionalities.
- **Example**:
  - `useHabitList.ts` (only handles habit retrieval and list state)
  - `HabitCard.tsx` (only handles the visual rendering of a single habit)
  - `habitService.ts` (only handles HTTP/Supabase API requests for habits)

---

## 2. SOLID Principles

### S - Single Responsibility Principle (SRP)
- A class, component, hook, or function must have exactly one reason to change.
- **Application**:
  - React components should only render UI. Logic (such as data fetching or complex calculations) must be extracted into custom hooks.
  - Custom hooks should only manage a single aspect of state or side effects.
  - Services should only handle integration details (e.g. database querying or API calls).

### O - Open/Closed Principle (OCP)
- Software entities must be open for extension but closed for modification.
- **Application**:
  - Design components to accept customizable children, sub-components, or configuration props (e.g., render-prop patterns or compound components) rather than modifying the core implementation for every new use case.
  - Implement plugin or strategy patterns when handling multiple visual tiers or frequency calculations.

### L - Liskov Substitution Principle (LSP)
- Objects or classes of a superclass/interface should be replaceable with objects/classes of a subclass without affecting the correctness of the program.
- **Application**:
  - Interfaces must be respected. A mock API service must behave exactly like the real API service, returning the same schema and handling errors consistently.
  - Extended components must not break the standard behavior of their base elements.

### I - Interface Segregation Principle (ISP)
- Clients should not be forced to depend on interfaces they do not use.
- **Application**:
  - Avoid large, monolithic interface declarations.
  - React components should define props that represent only the fields they actually need, rather than taking a whole database model object if they only use two fields.

### D - Dependency Inversion Principle (DIP)
- High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Application**:
  - Do not tightly couple components to specific API client instances. Use React Context Providers or dependency injection patterns to pass client instances (like Supabase client or local storage wrappers).

---

## 3. Design by Contract (DbC)

All functions and methods must explicitly define and enforce contracts to ensure reliability.

### Preconditions (Inputs)
- What must be true before a function executes.
- **Rule**: Validate all inputs at the boundary. Use TypeScript static typing, custom type guards, or Zod schemas.
- **Action**: Check parameters for valid states (e.g. not null, within acceptable bounds) and throw explicit errors or return clean validation objects if violated.

### Postconditions (Outputs)
- What the function guarantees to return if preconditions are met.
- **Rule**: Function outputs must strictly match their type signatures.
- **Action**: Use return type annotations in TypeScript. Ensure all code paths return a valid output or raise a typed, expected exception.

### Invariants (State)
- What remains true during the lifetime of a component or system.
- **Rule**: Protect internal state from entering invalid configurations.
- **Action**: Use encapsulated state management or immutable data updates so that the state transitions cleanly.

---

## 4. DRY (Don't Repeat Yourself) & YAGNI (You Aren't Gonna Need It)

### DRY - Don't Repeat Yourself
- Every piece of knowledge or logic must have a single, unambiguous representation within the system.
- **Rule**: If you find yourself copying logic, extract it into a pure utility, custom hook, or shared component.
- **Exception**: Do not over-abstract if it leads to premature complexity (keep SRP in mind).

### YAGNI - You Aren't Gonna Need It
- Do not add features, code, dependencies, or files based on assumed future requirements.
- **Rule**: Implement only what is requested/necessary for the current task. Do not pre-optimize, and do not write placeholder code for potential features.

---

## 5. Architectural Separation of Purpose
- **Root Level**: Clear separation between `frontend/` (Next.js client) and `backend/` (Supabase config and schema migrations).
- **Frontend Layers**:
  - `app/` files are restricted to routing and root layouts.
  - `components/` handle rendering and visual layout.
  - `hooks/` handle component lifecycle, state, and side effects.
  - `services/` handle database and third-party interactions.
  - `types/` store domain structures.
  - `utils/` are stateless pure helper functions.
