export interface Group {
  url: string;
  name: string;
}

export interface NewUser {
  username: string;
  email: string;
}

export interface User extends NewUser{
  url: string;
  groups: Group[];
}
