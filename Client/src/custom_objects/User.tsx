import { AdminPrivilege } from "./AdminPrivilege"

export interface User{
    ID: number;
    FirstName: string;
    LastName: string;
    Email: string;
    Device: string;
    Major: string;
    GradYear: number;
    AdminPrivileges: AdminPrivilege[]
}