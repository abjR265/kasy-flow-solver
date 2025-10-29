import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/stores/useStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function GroupSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const groups = useStore((state) => state.groups);
  const activeGroupId = useStore((state) => state.activeGroupId);
  const setActiveGroupId = useStore((state) => state.setActiveGroupId);
  const addGroup = useStore((state) => state.addGroup);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      members: [],
      vaultId: null,
    };
    
    addGroup(newGroup);
    setActiveGroupId(newGroup.id);
    setNewGroupName("");
    setShowCreateDialog(false);
    setOpen(false);
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span className="truncate">{activeGroup?.name || "Select group..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandList>
            <CommandEmpty>No group found.</CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <CommandItem
                  key={group.id}
                  value={group.id}
                  onSelect={() => {
                    setActiveGroupId(group.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      activeGroupId === group.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {group.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setShowCreateDialog(true);
                  setOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Enter a name for your new group or room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Room 4A, Sushi Night"
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateGroup();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
