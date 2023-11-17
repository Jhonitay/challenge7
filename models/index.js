const { PrismaClient } = require("@prisma/client"),
    prisma = new PrismaClient()

module.exports={
    user: prisma.users
}