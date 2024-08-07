import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class User {
  static async create({ password, email, username, name }) {
    const result = await prisma.user.create({
      data: {
        password,
        email,
        username,
        name
      }
    });
    return result;
  }

  static async findByUsername(username) {
    const result = await prisma.user.findUnique({
      where: { username }
    });
    return result;
  }

  static async findByEmail(email) {
    const result = await prisma.user.findUnique({
      where: { email }
    });
    return result;
  }

  static async findById(id) {
    const result = await prisma.user.findUnique({
      where: { id }
    });
    return result;
  }

  static async findAll() {
    const result = await prisma.user.findMany();
    return result;
  }

  static async update(id, { password, email }) {
    const result = await prisma.user.update({
      where: { id },
      data: {
        password,
        email
      }
    });
    return result;
  }

  static async delete(id) {
    await prisma.user.delete({
      where: { id }
    });
  }
}

export default User;
