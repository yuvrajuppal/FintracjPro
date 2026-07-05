import { PrismaClient } from "#prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
export const prisma = new PrismaClient({
adapter: new PrismaMariaDb(process.env.DATABASE_URL),
});

export const productionmode  = false