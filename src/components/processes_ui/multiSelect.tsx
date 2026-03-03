import { Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";

type Option = { id: string; name: string };

export default function MultiSelect({
    label,
    options = [],
    selected = [],
    onChange,
    searchValue,
    onSearchValueChange,
    loading,
    placeholder = "Buscar...",
}: {
    label: string;
    options?: Option[];
    selected?: string[];
    onChange: (value: string[]) => void;
    searchValue?: string;
    onSearchValueChange?: (value: string) => void;
    loading?: boolean;
    placeholder?: string;
}) {
    return (
        <div>
            <div className="text-xs text-muted-foreground mb-1">{label}</div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        {selected.length === 0 ? "Selecionar..." : `${selected.length} selecionado(s)`}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={placeholder}
                            value={searchValue}
                            onValueChange={(v) => onSearchValueChange?.(v)}
                        />

                        {loading ? (
                            <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando...
                            </div>
                        ) : (
                            <>
                                {options.length === 0 && (
                                    <div className="p-3 text-xs text-muted-foreground">Nenhum resultado</div>
                                )}

                                <CommandGroup>
                                    {options.map((option) => {
                                        const isSelected = selected.includes(option.id);

                                        return (
                                            <CommandItem
                                                key={option.id}
                                                value={option.name} // ✅ importante pro cmdk
                                                onSelect={() => {
                                                    if (isSelected) {
                                                        onChange(selected.filter((id) => id !== option.id));
                                                    } else {
                                                        onChange([...selected, option.id]);
                                                    }
                                                }}
                                            >
                                                {option.name}
                                                {isSelected && <Check className="ml-auto h-4 w-4" />}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2 mt-2">
                {selected.map((id) => {
                    const item = options.find((o) => o.id === id);
                    if (!item) return null;

                    return (
                        <Badge key={id} variant="secondary">
                            {item.name}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}