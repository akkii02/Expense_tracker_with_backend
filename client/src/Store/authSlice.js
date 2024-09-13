import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLogin: false,
    token:null,
    premiumUser:true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state) => {
            state.isLogin = true;
        },
        logout: (state) => {
            state.isLogin = false;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setPremiumUser:(state)=>{
            state.premiumUser = false
        }
    },
})

export const { login, logout ,setToken,setPremiumUser } = authSlice.actions;
export default authSlice.reducer;