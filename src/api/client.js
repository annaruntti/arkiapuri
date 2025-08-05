import axios from 'axios'
import getEnvVars from '../../environment'

const { apiUrl } = getEnvVars()

export default axios.create({ baseURL: apiUrl })
