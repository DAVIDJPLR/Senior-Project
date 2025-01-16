import { AdminPrivilege } from "./AdminPrivilege"

export interface User{
    ID: number,
    Email: string,
    Device: string,
    Major: string,
    GradYear: number,
    AdminPrivileges: AdminPrivilege[]
}