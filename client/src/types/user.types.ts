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
