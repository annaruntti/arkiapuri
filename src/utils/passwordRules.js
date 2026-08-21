export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const passwordLengthRules = {
    minLength: {
        value: PASSWORD_MIN_LENGTH,
        message: `Salasanan pituuden tulee olla vähintään ${PASSWORD_MIN_LENGTH} merkkiä`,
    },
    maxLength: {
        value: PASSWORD_MAX_LENGTH,
        message: `Salasanan pituuden tulee olla enintään ${PASSWORD_MAX_LENGTH} merkkiä`,
    },
}
