import { User, UserRef, Badge } from "@/types";

export const mockBadges: Badge[] = [
  {
    code: "TABLE_HERO",
    label: "Table Hero",
    earnedAtISO: "2025-10-15T10:00:00Z",
  },
  {
    code: "PAY_IT_FORWARD",
    label: "Pay It Forward",
    earnedAtISO: "2025-10-20T14:30:00Z",
  },
];

export const mockUsers: User[] = [
  {
    id: "user-1",
    handle: "@alice",
    displayName: "Alice Chen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    venmo: "@alice-chen",
    paypal: "alice.chen@email.com",
    repScore: 95,
    badges: mockBadges,
  },
  {
    id: "user-2",
    handle: "@bob",
    displayName: "Bob Martinez",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    venmo: "@bob-martinez",
    paypal: "bob.m@email.com",
    repScore: 88,
    badges: [mockBadges[0]],
  },
  {
    id: "user-3",
    handle: "@carol",
    displayName: "Carol Wu",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    venmo: "@carol-wu",
    paypal: "carol.wu@email.com",
    repScore: 92,
    badges: [mockBadges[1]],
  },
  {
    id: "user-4",
    handle: "@david",
    displayName: "David Kim",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    venmo: "@david-kim",
    paypal: null,
    repScore: 76,
    badges: [],
  },
];

export const toUserRef = (user: User): UserRef => ({
  id: user.id,
  handle: user.handle,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
});

export const mockUserRefs: UserRef[] = mockUsers.map(toUserRef);

export const getCurrentUser = (): User => mockUsers[0]; // Alice is the current user
