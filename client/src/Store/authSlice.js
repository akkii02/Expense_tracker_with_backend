import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLogin: false,
    token:null,
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
    },
})

export const { login, logout ,setToken } = authSlice.actions;
export default authSlice.reducer;