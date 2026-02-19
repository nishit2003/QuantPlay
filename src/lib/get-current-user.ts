import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      virtualCashBalance: true,
      startingVirtualCashBalance: true,
      referralCode: true,
      createdAt: true,
    },
  });

  return user;
}
