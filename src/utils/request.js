/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-12-01 10:43:47
 * @LastEditors: solid
 * @LastEditTime: 2022-12-01 10:44:50
 */
import axios from 'axios'
const service = axios.create({
	timeout: 50000
})
service.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        // do something with request error
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        // if the custom code is not 20000, it is judged as an error.
        return response.data
    },
    error => {
        console.log(error);
    }
)

export default service