export const isRoleMatched = (decoded, role) => {
    if(!decoded) {
        return false;
    }

    if(Array.isArray(decoded[import.meta.env.VITE_CLAIMS_ROLE])) {

        return decoded[import.meta.env.VITE_CLAIMS_ROLE].includes(role)
    }

    return decoded[import.meta.env.VITE_CLAIMS_ROLE] === role
}