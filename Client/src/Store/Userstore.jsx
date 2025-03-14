import {configureStore} from '@reduxjs/toolkit'
import  users from './Useraction'
import admin from './Adminaction'
const Userstore=configureStore({
    reducer:{
      userdata:users,
      adminside:admin
    }
})
export default Userstore