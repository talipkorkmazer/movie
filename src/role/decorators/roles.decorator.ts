import { SetMetadata } from '@nestjs/common';

// This decorator is used to restrict access to routes based on the roles of the user. Currently unused. Nice to have.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
