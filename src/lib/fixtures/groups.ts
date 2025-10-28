import { Group } from "@/types";
import { mockUserRefs } from "./users";

export const mockGroups: Group[] = [
  {
    id: "group-1",
    name: "Room 4A",
    members: [mockUserRefs[0], mockUserRefs[1], mockUserRefs[2]],
    vaultId: "vault-1",
  },
  {
    id: "group-2",
    name: "Sushi Night Oct 25 2025",
    members: [mockUserRefs[0], mockUserRefs[1], mockUserRefs[3]],
    vaultId: null,
  },
  {
    id: "group-3",
    name: "Weekend Hiking Crew",
    members: mockUserRefs,
    vaultId: null,
  },
];
