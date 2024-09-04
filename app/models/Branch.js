import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class Branch {
  static async create({ branch_code, branch_name, created_by, updated_by }) {
    const result = await prisma.branch.create({
      data: {
        branch_code,
        branch_name,
        created_by,
        updated_by,
        createdby: created_by,
        updatedby: updated_by
      }
    });
    return result;
  }

  // static async findByUsername(username) {
  //   const result = await prisma.user.findUnique({
  //     where: { username }
  //   });
  //   return result;
  // }

  static async findById(id) {
    const result = await prisma.branch.findUnique({
      where: { id }
    });
    return result;
  }

  static async findAll() {
    const result = await prisma.branch.findMany();
    return result;
  }

  // static async update(id, { password, email }) {
  //   const result = await prisma.user.update({
  //     where: { id },
  //     data: {
  //       password,
  //       email
  //     }
  //   });
  //   return result;
  // }

  // static async delete(id) {
  //   await prisma.user.delete({
  //     where: { id }
  //   });
  // }
}

export default Branch;
