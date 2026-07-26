// Mirrors: LibraryManagement.Application.DTOs.User.*

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentId?: string;
  department?: string;
  profileImageUrl?: string;
  roles: string[];
}

export interface UpdateProfileRequestDto {
  firstName: string;
  lastName: string;
  studentId?: string;
  department?: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AdminUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  isActive: boolean;
  registrationDate: string;
  profileImageUrl?: string;
}

export interface UserResourceParameters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  role?: string;
  isActive?: boolean;
}

export interface UpdateAdminUserRequestDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  username?: string;
}

export interface AssignRoleRequestDto {
  role: string;
}
