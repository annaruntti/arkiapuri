import { gql, useMutation } from '@apollo/client'

// Queries
const GET_ALL_AUTHOR = gql`
    query getAllAuthors {
        getAllAuthors {
            id
            authorName
            description
            email
        }
    }
`

const GET_SINGLE_AUTHOR = gql`
    query getSingleAuthor {
        getSingleAuthor {
            id
            authorName
            description
            email
        }
    }
`
// Mutations
const ADD_NEW_AUTHOR = gql`
    mutation createAuthor(
        $authorName: String
        $description: String
        $email: String
    ) {
        createAuthor(
            author: {
                authorName: $authorName
                description: $description
                email: $email
            }
        ) {
            id
            authorName
            description
            email
        }
    }
`
const UPDATE_AUTHOR = gql`
    mutation updateAuthor(
        $id: String
        $authorName: String
        $description: String
        $email: String
    ) {
        updateAuthor(
            id: $id
            author: {
                authorName: $authorName
                description: $description
                email: $email
            }
        ) {
            id
            authorName
            description
            email
        }
    }
`
const DELETE_AUTHOR_BY_ID = gql`
    mutation deleteAuthor($id: String) {
        deleteAuthor(id: $id)
    }
`

const DELETE_ALL_AUTHOR = gql`
    mutation deleteAllAuthor {
        deleteAllAuthors
    }
`

export {
    GET_ALL_AUTHOR,
    GET_SINGLE_AUTHOR,
    ADD_NEW_AUTHOR,
    UPDATE_AUTHOR,
    DELETE_AUTHOR_BY_ID,
    DELETE_ALL_AUTHOR,
}
