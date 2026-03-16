const FLOORS: number[] = [2, 1];

interface FloorToggleProps {
    currentFloor: number;
    onChange: (floor: number) => void;
}

/**
 * Vertical pill toggle for switching between building floors.
 */
export function FloorToggle({ currentFloor, onChange }: FloorToggleProps) {
    return (
        <div className="flex flex-col items-center border-2 border-gray-800 rounded-full overflow-hidden">
            {FLOORS.map((floor) => (
                <button
                    key={floor}
                    onClick={() => onChange(floor)}
                    aria-pressed={currentFloor === floor}
                    className={`w-9 h-9 text-sm font-bold transition-colors duration-200 ${currentFloor === floor
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                        }`}
                >
                    {floor}
                </button>
            ))}
        </div>
    );
}