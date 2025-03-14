import { createSlice } from "@reduxjs/toolkit";

const Useradmin=createSlice({
    name:"Admin",
    initialState:{
      usermanage:[],
      allusers:[]
    },
    reducers:{
     addallusers:(state,action)=>{
    
      if (Array.isArray(action.payload)) {
    
        state.usermanage.push(...action.payload);
        state.allusers.push(...action.payload);
      } else {
   
        state.usermanage.push(action.payload);
      }
    
     }  ,
     searchUser: (state, action) => {
      const searchTerm = action.payload.trim(); 
      if (searchTerm === "") {
       state.usermanage=state.allusers 
      }else{
        const regex = new RegExp(searchTerm, "i"); 
        state.usermanage = state.usermanage.filter(user =>
          regex.test(user.username) 
        );
      }
    
    },
    editOneuser:(state,action)=>{
      const index = state.usermanage.findIndex(
        user => user._id === action.payload._id
    );
    if (index !== -1) {
      state.usermanage[index] = action.payload;
  }
  
    },
    deleteoneuser:(state,action)=>{
      const index = state.usermanage.findIndex(
        user => user._id === action.payload
    );
    if (index !== -1) {
      state.usermanage.splice(index,1)
  }
    
      
      
    }
        
    }
})
export const {addallusers,searchUser,editOneuser,deleteoneuser} =Useradmin.actions
export default Useradmin.reducer

