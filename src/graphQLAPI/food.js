//food or grocery or item to by

import { gql, useMutation } from '@apollo/client'

// Queries
const GET_ALL_FOODS = gql`
    query getAllFoods {
        getAllFoods {
            foodId
            title
            description
            expirationDate
        }
    }
`

const GET_SINGLE_FOOD = gql`
    query getSingleFOOD {
        getSingleFood {
            foodId
            title
            description
            expirationDate
        }
    }
`
// Mutations
const ADD_NEW_FOOD = gql`
    mutation createFood(
        $title: String
        $description: String
        $expirationDate: Int
    ) {
        createFood(
            food: {
                title: $title
                description: $description
                expirationDate: $expirationDate
            }
        ) {
            foodId
            title
            description
            expirationDate
        }
    }
`
const UPDATE_FOOD = gql`
    mutation updateFood(
        $foodId: String
        $title: String
        $description: String
        $expirationDate: Int
    ) {
        updateFood(
            foodId: $foodId
            food: {
                title: $title
                description: $description
                expirationDate: $expirationDate
            }
        ) {
            foodId
            title
            description
            expirationDate
        }
    }
`
const DELETE_FOOD_BY_ID = gql`
    mutation deleteFood($foodId: String) {
        deleteFood(foodId: $foodId)
    }
`

const DELETE_ALL_FOODS = gql`
    mutation deleteAllFoods {
        deleteAllFoods
    }
`

export {
    GET_ALL_FOODS,
    GET_SINGLE_FOOD,
    ADD_NEW_FOOD,
    UPDATE_FOOD,
    DELETE_FOOD_BY_ID,
    DELETE_ALL_FOODS,
}
