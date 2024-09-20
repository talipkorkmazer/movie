export interface UserModel {
  id: string;
  username: string;
  age: number;
  Role: {
    name: string;
    Permissions: string[];
  };
  iat?: number;
  exp?: number;
}

export interface UserWithRolePermissions {
  id: string;
  username: string;
  age: number;
  Role: {
    name: string;
    Permissions: {
      permission: {
        name: string;
      };
    }[];
  };
}
