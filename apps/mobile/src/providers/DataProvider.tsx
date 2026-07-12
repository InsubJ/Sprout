import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
interface DataContextValue { revision: number; invalidate(): void }
const DataContext = createContext<DataContextValue | null>(null);
export function DataProvider({ children }: PropsWithChildren) { const [revision, setRevision] = useState(0); const invalidate = useCallback(() => setRevision(value => value + 1), []); return <DataContext.Provider value={useMemo(() => ({ revision, invalidate }), [revision, invalidate])}>{children}</DataContext.Provider>; }
export function useDataRevision(): DataContextValue { const value = useContext(DataContext); if (!value) throw new Error('useDataRevision must be used within DataProvider'); return value; }
