
export type Group = {
    name: string; // Name
    slug: string; // Slug
    image?: string; // Image
    contact_email?: string; // Contact email
    description?: string; // Description
    leader?: {
        first_name: string; // First name
        last_name: string; // Last name
    }
};    