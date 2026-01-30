import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Popular US cities and metro areas
const US_LOCATIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "Nashville, TN",
  "Detroit, MI",
  "Portland, OR",
  "Las Vegas, NV",
  "Memphis, TN",
  "Atlanta, GA",
  "Miami, FL",
  "Raleigh, NC",
  "Tampa, FL",
  "Minneapolis, MN",
  "Remote",
  "Remote - US",
  "Hybrid",
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  id?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., San Francisco, CA",
  maxLength = 200,
  id = "location",
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = US_LOCATIONS.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setFilteredLocations(filtered);
      setIsOpen(filtered.length > 0 && document.activeElement === inputRef.current);
    } else {
      setFilteredLocations([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredLocations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredLocations[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (filteredLocations.length > 0) setIsOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="location-suggestions"
      />
      {isOpen && filteredLocations.length > 0 && (
        <ul
          ref={listRef}
          id="location-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto"
        >
          {filteredLocations.map((location, index) => (
            <li
              key={location}
              role="option"
              aria-selected={highlightedIndex === index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm",
                highlightedIndex === index
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onMouseDown={() => handleSelect(location)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
