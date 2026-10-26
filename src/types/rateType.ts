export interface Rate {
    _id: string
    authorName: string
    content: string
    rate: number
    package: string
    createdAt: string
    updatedAt: string
}

export interface RateForm {
    _id?: string;
    authorName: string
    content: string
    rate: number
    package: string
}
