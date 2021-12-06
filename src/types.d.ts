export type UserGetReqQuery = {
    name?: string;
    surname?: string;
}

export type UserGetResponse = {
    name: string;
    surname: string;
}

export type RecordPostReqBody = {
    email: string;
    cname: string;
    disease_code: string,
    total_deaths: number,
    total_patients: number
}