import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

//crating custom decorator
export const ROLES_KEYS = 'roles';
//attaches metadata to a route and controller
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEYS, roles);
