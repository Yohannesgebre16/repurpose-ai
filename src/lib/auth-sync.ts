import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function syncUserAndWorkspace() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user has no email address.");
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0];

  // 1. Upsert the User in Supabase
  const user = await db.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email,
      name: fullName,
    },
    create: {
      id: clerkUser.id,
      email,
      name: fullName,
    },
    include: {
      workspaces: true,
    },
  });

  // 2. Ensure the user has at least one default Workspace
  if (user.workspaces.length === 0) {
    const defaultWorkspace = await db.workSpace.create({
      data: {
        name: `${fullName}'s Workspace`,
        ownerId: user.id,
      },
    });

    return {
      user,
      activeWorkspace: defaultWorkspace,
    };
  }

  return {
    user,
    activeWorkspace: user.workspaces[0],
  };
}