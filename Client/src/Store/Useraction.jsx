import { createSlice } from "@reduxjs/toolkit";

const Createuser=createSlice({
   name:'Users',
   initialState:{
    costomer:[]
   },
   reducers:{
    addusers:(state,action)=>{
        state.costomer.push(action.payload)
    },
    clearuser:(state)=>{
   state.costomer.length=0
    }
    
   }

})
export const {addusers,clearuser} =Createuser.actions
export default Createuser.reducer





