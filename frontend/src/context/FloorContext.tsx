import { createContext, useContext, useState } from "react";

interface FloorContextType {
    floor: number;
    setFloor: (floor: number) => void;
}

const FloorContext = createContext<FloorContextType>({
    floor: 1,
    setFloor: () => { },
});

interface FloorProviderProps {
    initialFloor: number;
    children: React.ReactNode;
}

export function FloorProvider({ initialFloor, children }: FloorProviderProps) {
    const [floor, setFloor] = useState<number>(initialFloor);

    return (
        <FloorContext.Provider value={{ floor, setFloor }}>
            {children}
        </FloorContext.Provider>
    );
}

export function useFloor() {
    return useContext(FloorContext);
}