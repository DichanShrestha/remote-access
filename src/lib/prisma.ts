import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = (): PrismaClient => {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    return new PrismaClient({ adapter });
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
